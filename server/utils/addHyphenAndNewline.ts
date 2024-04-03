export function addHyphenAndNewline(message: string) {
  // Split the message into words
  let words = message.split(" ");

  // Iterate through each word
  for (let i = 0; i < words.length; i++) {
    // Check if the word is longer than 20 characters
    if (words[i].length > 20) {
      // Split the word into chunks of 20 characters
      let chunks = words[i].match(/.{1,20}/g);

      // Join the chunks with a hyphen and add a newline
      words[i] = chunks!.join("-\n");
    }
  }

  // Join the words back into a string
  let result = words.join(" ");

  return result;
}