module.exports = (ctx) => {
  switch(ctx.encode) {
    case "xor":
      return xor()
      break;
    case "plain":
      return {
        encode(str) {
          return str
        },
        decode(str) {
          return str
        }
      }
      break;
    case "base64":
      return {
        encode(str) {
          return str
        },
        decode(str) {
          return str
        }
      }
      break;
    default:
      return {
        encode(str) {
          return str
        },
        decode(str) {
          return str
        }
      }
      break;
  }
}

function xor() {
  return {
    encode(str) {
      encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    },
    decode(str) {
      decodeURIComponent(str).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('');
    }
  }
}