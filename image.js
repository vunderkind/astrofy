const base64 = require('image-to-base64')
async function getbase () {
  await base64('https://pbs.twimg.com/profile_images/1254941388875206657/Q7HIttwB_400x400.jpg')
  .then( (res) => { return res })
  .catch( (err) => { console.error(err)})
}
let img = getbase()
console.log(img)
