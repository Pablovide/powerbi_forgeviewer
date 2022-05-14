# PowerBI-ForgeViewer

## Requisites

1. Use npm to install Pbiviz.

   ```bash
   npm i -g powerbi-visuals-tools
   ```
   Then follow [this](https://docs.microsoft.com/en-us/power-bi/developer/visuals/environment-setup?tabs=windows#create-and-install-a-certificate) tutorial to create and install a certificate to interact with 
the Power BI service.

2. Have a model urn base64-encoded from any bucket in your account. 

3. Have a web API exposing an endpoint that returns a Forge token with at least viewables:read scope. 

   Else you will have to hardcode your token in the getToken() method. 
   ```typescript
     // Path: /forgeviewer/src/visual.ts line 58

     private async getToken(): Promise<string> {
        /*let token;
        await fetch(this.TOKEN_ENDPOINT)
          .then((res) => res.json())
          .then((data) => (token = data));
        return token.accessToken;
        */
        return {{your token goes here}};
     }
   ```

   In my case, API returns an object, so I return the accessToken property. You might modify the method if you only get the string. Do not add `bearer`, it is added by default. 

##  Usage

First, setup the following variables in visual.ts:

```typescript
  //here goes your API endpoint. 
  private TOKEN_ENDPOINT = "https://localhost:44348/token"; 
  //here goes your model urn. Do not delete `urn:` from the beginning, just paste the urn encoded behind the colon
  private DOCUMENT_URN = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGVtby1wb3dlcmJpLXJlcG9ydC9NRVJDQURPLVBERi5mYng=";
```

Run `npm install` in /forgeviewer if you haven't yet.

Then `pbiviz start`.
This will start a local server exposing your visual. 

Next, open Power BI in your browser. Ensure that you have enabled the developer mode, and add a developer visual in a report from the Visualizations pane.

![VisualizationsPane](https://docs.microsoft.com/en-us/power-bi/includes/media/visual-tutorial-view/developer-visual.png) 