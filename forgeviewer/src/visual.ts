/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import { utcFormat } from "d3";
export class Visual implements IVisual {
  private TOKEN_ENDPOINT = "https://localhost:44348/token";
  private DOCUMENT_URN =
    "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGVtby1wb3dlcmJpLXJlcG9ydC8zJTIwU3RvcnklMjBCdWlsZGluZyUyME1vZGVsLnJ2dA==";

  private target: HTMLElement;
  private settings: VisualSettings;
  private forge_viewer: Autodesk.Viewing.GuiViewer3D = null;

  constructor(options: VisualConstructorOptions) {
    console.log("Visual constructor", options);
    this.target = options.element;
    this.target.innerHTML = '<div id="forge-viewer"></div>';
    this.initForgeViewer();
  }

  private async getToken(): Promise<string> {
    let token;
    await fetch(this.TOKEN_ENDPOINT)
      .then((res) => res.json())
      .then((data) => (token = data));
    return token.accessToken;
  }

  private async initForgeViewer(): Promise<void> {
    let token = await this.getToken();
    let options = {
      env: "AutodeskProduction",
      accessToken: token,
    };
    await this.loadScriptAndStyle();

    Autodesk.Viewing.Initializer(options, () => {
      this.forge_viewer = new Autodesk.Viewing.GuiViewer3D(
        document.getElementById("forge-viewer")
      );
      this.forge_viewer.start();

      Autodesk.Viewing.Document.load(
        this.DOCUMENT_URN,
        (doc) => {
          var viewables: Autodesk.Viewing.BubbleNode = doc
            .getRoot()
            .getDefaultGeometry();
          this.forge_viewer.loadDocumentNode(doc, viewables, {}).then((i) => {
            this.forge_viewer.addEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
              (res) => {
                this.forge_viewer.getObjectTree((tree) => {
                  var leaves = [];
                  tree.enumNodeChildren(
                    tree.getRootId(),
                    (dbId) => {
                      if (tree.getChildCount(dbId) === 0) {
                        leaves.push(dbId);
                      }
                    },
                    true
                  );
                });
              }
            );
          });
        },
        () => {}
      );
    });
  }

  private async loadScriptAndStyle(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let forgeviewerjs = document.createElement("script");
      forgeviewerjs.src =
        "https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js";

      forgeviewerjs.id = "forgeviewerjs";
      document.body.appendChild(forgeviewerjs);

      forgeviewerjs.onload = () => {
        console.log("script loaded");

        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css";
        link.type = "text/css";
        link.id = "forgeviewercss";
        document.body.appendChild(link);
        console.log("style loaded");
        resolve();
      };

      forgeviewerjs.onerror = (err) => {
        console.info("Viewer scripts error:" + err);
        reject(err);
      };
    });
  }

  public update(options: VisualUpdateOptions) {
    console.log('updating....')


    if(options.type == 2) {

      debugger; 
      console.log('this is a data update')
    }

    if (!this.forge_viewer) return;

    console.log(options)

    const dbIds = options.dataViews[0].table.rows.map(
      (r) => <number>r[0].valueOf()
    );

    console.log(dbIds)

    this.forge_viewer.showAll();
    this.forge_viewer.setGhosting(true);
    this.forge_viewer.isolate(dbIds);
    console.log('updated')
  }

  private static parseSettings(dataView: DataView): VisualSettings {
    return VisualSettings.parse(dataView) as VisualSettings;
  }

  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    return VisualSettings.enumerateObjectInstances(
      this.settings || VisualSettings.getDefault(),
      options
    );
  }
}
