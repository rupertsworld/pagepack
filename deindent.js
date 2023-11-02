function deindent(multiLineString) {
  const lines = multiLineString.split('\n');

  // Get the common leading whitespace length
  let commonIndentLength = Infinity;
  for (const line of lines) {
    if (line.trim() !== '') {
      const leadingWhitespace = line.match(/^\s*/)[0];
      if (leadingWhitespace.length < commonIndentLength) {
        commonIndentLength = leadingWhitespace.length;
      }
    }
  }

  // De-indent and trim whitespace
  const deIndentedLines = lines.map((line) => {
    if (line.trim() !== '') {
      return line.substring(commonIndentLength).trimRight();
    }
    return line.trim();
  });

  // Rejoin the lines to form the de-indented string
  const deIndentedString = deIndentedLines.join('\n').trim();

  return deIndentedString;
}

export default deindent;
