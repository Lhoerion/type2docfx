var dfmRegex = [
  /\[(?:([^\]]+))\]{(@link|@link|@linkcode|@linkplain) +(?:module:)?([^}| ]+)}/g,
  /\{(@link|@linkcode|@linkplain) +(?:module:)?([^}| ]+)(?:(?:\|| +)([^}]+))?\}/g
];

export function getTextAndLink(text: string) {
  var matches = dfmRegex[0].exec(text);
  if (matches && matches[1] && matches[3]) {
    return [matches[1], matches[3]];
  }
  matches = dfmRegex[1].exec(text);
  if (matches && matches[3] && matches[2]) {
    return [matches[3], matches[2]];
  }
  return [];
}

export function getLink(text: string) {
  var matches = dfmRegex[0].exec(text);
  if (matches && matches[3]) {
    return [matches[3].replace(/~|-|#/g, '.')];
  }
  matches = dfmRegex[1].exec(text);
  if (matches && matches[2]) {
    return [matches[2].replace(/~|-|#/g, '.')];
  }
  return [];
}

export function convertLinkToGfm(text: string, uidPrefix: string = null) {
  if (!text) return '';
  var dfmLinkRules = [
    {
      // [link text]{@link namepathOrURL}
      regexp: dfmRegex[0],
      callback: function (match: any, p1: any, p2: any, p3: any) {
        return generateDfmLink(p2, p3, p1);
      }
    },
    {
      // {@link namepathOrURL}
      // {@link namepathOrURL|link text}
      // {@link namepathOrURL link text (after the first space)}
      regexp: dfmRegex[1],
      callback: function (match: any, p1: any, p2: any, p3: any) {
        return generateDfmLink(p1, p2, p3);
      }
    }
  ];

  var result = text;
  dfmLinkRules.forEach(function (r) {
    result = result.replace(r.regexp, r.callback);
  });
  return result;

  function generateDfmLink(tag: string, target: string, text: string) {
    var result = '';
    if (!text) {
      // if link text is undefined, it must link to namepath(uid)
      result = '<xref:' + convertNamepathToUid(target) + '>';
      if (tag === '@linkcode') {
        return '<code>' + result + '</code>';
      }
    } else {
      result = text;
      if (tag === '@linkcode') {
        result = '<code>' + result + '</code>';
      }
      result = '[' + result + '](';
      // http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url#answer-3809435
      if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(target)) {
        // if target isn't a url, it must be a namepath(uid)
        result += 'xref:';
        target = convertNamepathToUid(target);
      }
      result += target + ')';
    }
    return result;

    // TODO: Make namepathOrURL more reliable
    function convertNamepathToUid(namepath: string) {
      var uid = namepath.replace(/~|-|#/g, '.');
      if (uidPrefix) {
        uid = uidPrefix + '.' + uid;
      }
      return encodeURIComponent(uid);
    }
  }
}
