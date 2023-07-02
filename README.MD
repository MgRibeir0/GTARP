### TODO

- SISTEMA DE ASSINATURA
- PASSAR TUDO PARA TYPESCRIPT

## Modelo para config.json

```json
{
  "tokenPROD": "MAIN-BOT-TOKEN-GOES-HERE",
  "clientIDPROD": "MAIN-BOT-USER-ID-GOES-HERE",
  "tokenDEV": "DEV-BOT-TOKEN-GOES-HERE",
  "guildIDDEV": "GUILD-ID-FOR-DEV-BOT-GOES-HERE",
  "clientIDDEV": "DEV-BOT-USER-ID-GOES-HERE"
}
```

I dont use the guildIDPROD because i use the bot in multiple servers, so global commands, but if you want to use it, just add it to the config.json and change the code in the deploy.js file.

```js
// deploy.js
const data = await rest.put(
  Routes.applicationGuildCommands(clientIDPROD, guildIDPROD),
  { body: commands }
);
```
