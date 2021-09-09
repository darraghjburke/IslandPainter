# Island Painter
A Babylon.js demo by Darragh Burke. Uses Colyseus for networking and React for UI. Assets by [@KayLousberg](https://twitter.com/KayLousberg).

To run locally: `npm install` and then `npm run start`.

To run the server locally: `cd server`, `npm run start`. You will need to change the URL in Games.tsx to localhost.

To deploy to GH pages you can use `npm run deploy` - make sure to configure your `homepage` variable in `package.json`. To deploy your server to Colyseus Arena (currently in closed beta), do an `npm run build` from inside the `server` directory and then use the output in `lib`.