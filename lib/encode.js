module.exports = (ctx) => {
  switch(ctx.encode) {
    case "xor":
      return {
        encode(str) {
          return str
        },
        decode(str) {
          return str
        }
      }
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