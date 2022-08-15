// @ts-ignore
// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    function onInit() {

    }

    function onAfterRendering() {

    }

    function llamarUrl() {
        window.open("http://5678e7dftrial-dev-logali-approuter.cfapps.us10.hana.ondemand.com/logaligroupemployees/index.html");
    }

    function CreaEmpleado() {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        oRouter.navTo("navCreaEmpleado", {}, false);

    }

    function VisualizaEmpleado() {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        oRouter.navTo("navVisualizaEmpleado", {}, false);

    }



    return Controller.extend("logaligroup.empleados.controller.View", {
        onInit: onInit,
        onAfterRendering: onAfterRendering,
        llamarUrl: llamarUrl,
        CreaEmpleado: CreaEmpleado,
        VisualizaEmpleado: VisualizaEmpleado
    });
});
