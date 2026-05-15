
export const cleanJobDescription = (raw: string): string => {
  return raw
    .replace(/\r\n/g, '\n')        // normalize Windows line endings
    .replace(/\r/g, '\n')          // normalize old Mac line endings
    .replace(/\n{3,}/g, '\n\n')    // max 2 consecutive blank lines
    .replace(/[ \t]+$/gm, '')      // remove trailing spaces per line
    .replace(/&nbsp;/g, ' ')       // html entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\u2022/g, '•')       // normalize bullet unicode
    .replace(/\u2013/g, '-')       // en dash → hyphen
    .replace(/\u2014/g, '--')      // em dash → double hyphen
    .replace(/\u2018|\u2019/g, "'") // smart single quotes
    .replace(/\u201C|\u201D/g, '"') // smart double quotes
    .replace(/\t/g, '  ')          // tabs → 2 spaces
    .trim();
};

//Counts meaningful words in a string

export const wordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};


 //Truncates text to a max length with ellipsis
 
export const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
};