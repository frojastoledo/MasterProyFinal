// @ts-ignore
// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], function (Controller, History, Filter, FilterOperator, FilterType) {
    "use strict";

    function onInit() {
        this._splitAppEmployee = this.byId("splitAppEmployee");
    }

    
    function volverAtras() {
     
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteView", {}, true);
    }
 
    function buscarEmpleado(oEvent) {

        var oParameter = this.getView().byId("empSearch").getValue();

        var list = this.getView().byId("listItem");
        var oBinding = list.getBinding("items");

        var filter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, oParameter),
              new sap.ui.model.Filter("Dni", sap.ui.model.FilterOperator.Contains, oParameter)
            ],
            and: false
          });

        oBinding.filter(new sap.ui.model.Filter(filter,true));

        
    }

 
    function seleccionarEmpleado(oEvent) {

        this._splitAppEmployee.to(this.createId("detailEmployee"));
        var context = oEvent.getParameter("listItem").getBindingContext("odataModel");

        this.employeeId = context.getProperty("EmployeeId");
        var detailEmployee = this.byId("detailEmployee");

        detailEmployee.bindElement("odataModel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");

    }

  
    function borrarEmpleado(oEvent) {
       
        sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSeguroEliminar"), {
            title: this.getView().getModel("i18n").getResourceBundle().getText("confirmar"),
            onClose: function (oAction) {
                if (oAction === "OK") {
                    
                    this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                        success: function (data) {
                            sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("usuarioEliminado"));
                      
                            this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
                        }.bind(this),
                        error: function (e) {
                            sap.base.Log.info(e);
                        }.bind(this)
                    });
                }
            }.bind(this)
        });
    }

 
    function ascenderEmpleado() {

        if (!this._oDialog) {
             
           this._oDialog = sap.ui.xmlfragment("logaligroup/empleados/fragment/ascensoEmpleado", this);
           // connect dialog to view (models, lifecycle)
           this.getView().addDependent(this._oDialog);
        }
        
        this._oDialog.setModel(new sap.ui.model.json.JSONModel({}), "newRise");
        this._oDialog.open();
         
 
    }

   
 
    function ascender() {
    
        let ascensoNuevo   = this._oDialog.getModel("newRise");
     
        var odata = ascensoNuevo.getData();
       
        var body = {
            Amount: odata.Amount,
            CreationDate: odata.CreationDate,
            Comments: odata.Comments,
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: this.employeeId
        };
        this.getView().setBusy(true);
        this.getView().getModel("odataModel").create("/Salaries", body, {
            success: function () {
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrecto"));
                this.cerrarVentana();
            }.bind(this),
            error: function () {
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
            }.bind(this)
        });

    }

    function cerrarVentana() {
      this._oDialog.close()
    }

    function cambiar(oEvent) {
        var oUploadCollection = oEvent.getSource();
      
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: this.getView().getModel("odataModel").getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
    }
 
    function previaSubida(oEvent) {
        var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
            name: "slug",
            value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
    }

    function subidaCompleta(oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
    }

    function ficheroEliminado(oEvent) {
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
        this.getView().getModel("odataModel").remove(sPath, {
            success: function () {
                oUploadCollection.getBinding("items").refresh();
            },
            error: function () {

            }
        });
    }

    function descargarArchivo(oEvent) {
        let ruta = oEvent.getSource().getBindingContext("odataModel").getPath();

        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + ruta + "/$value");
    }

    return Controller.extend("logaligroup.empleados.controller.VisualizarEmpleado", {
        onInit: onInit,
        volverAtras: volverAtras,
        buscarEmpleado: buscarEmpleado,
        seleccionarEmpleado: seleccionarEmpleado,
        borrarEmpleado: borrarEmpleado,
        ascenderEmpleado: ascenderEmpleado,
        cerrarVentana: cerrarVentana,
        ascender: ascender,
        cambiar: cambiar,
        previaSubida: previaSubida,
        subidaCompleta: subidaCompleta,
        ficheroEliminado: ficheroEliminado,
        descargarArchivo: descargarArchivo
    });

});