// Extension for marked to support tweet embeds
// Syntax: [tweet:TWEET_ID]

export function markedTweet() {
  return {
    extensions: [
      {
        name: 'tweet',
        level: 'inline',
        start(src) {
          return src.match(/\[tweet:/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\[tweet:([^\]]+)\]/);
          if (match) {
            return {
              type: 'tweet',
              raw: match[0],
              tweetId: match[1]
            };
          }
        },
        renderer(token) {
          return `<blockquote class="twitter-tweet"><a href="https://twitter.com/i/status/${token.tweetId}">Tweet</a></blockquote>`;
        }
      }
    ]
  };
}

