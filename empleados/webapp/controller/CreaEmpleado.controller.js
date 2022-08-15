// @ts-ignore
// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, UploadCollectionParameter) {
    "use strict";

    function onBeforeRendering() {
        this._wizard = this.byId("CreaEmpleadoWizard");

        this._model = new sap.ui.model.json.JSONModel({});
        this.getView().setModel(this._model);

        var oFirstStep = this._wizard.getSteps()[0];
        this._wizard.discardProgress(oFirstStep);

        this._wizard.goToStep(oFirstStep);

        oFirstStep.setValidated(false);

    }


    function setearPaso(step) {
        var wizardNavContainer = this.byId("navCreaEmpleado");

        var fnAfterNavigate = function () {
            this._wizard.goToStep(this.byId(step));

            wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);

        wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
        wizardNavContainer.back();
    }


    function setearPasoUno() {
        setearPaso.bind(this)("PasoTipoEmpleado");
    }


    function setearPasoDos() {
        setearPaso.bind(this)("PasoDatosEmpleado");
    }

    function setearPasoTres() {
        setearPaso.bind(this)("OptionalInfoStep");
    }


    function llamarPasoDos(oEvent) {

        let pasoDatosEmpleado = this.byId("PasoDatosEmpleado");
        let pasoTipoEmpleado = this.byId("PasoTipoEmpleado");

        let origen = oEvent.getSource();
        let tipoEmpleado = origen.data("tipoEmpleado");
        let salario, tipo;

        switch (tipoEmpleado) {
            case "empInterno":
                salario = 24000;
                tipo = "0";
                break;
            case "empAutonomo":
                salario = 400;
                tipo = "1";
                break;
            case "empGerente":
                salario = 70000;
                tipo = "2";
                break;
            default:
                break;
        }

        this._model.setData({
            _type: tipoEmpleado,
            Type: tipo,
            _Salary: salario
        });


        if (this._wizard.getCurrentStep() === pasoTipoEmpleado.getId()) {
            this._wizard.nextStep();
        } else {

            this._wizard.goToStep(pasoDatosEmpleado);
        }
    }


    function validaDNI(oEvent) {
        if (this._model.getProperty("_type") !== "empAutonomo") {
            var dni = oEvent.getParameter("value");
            var number;
            var letter;
            var letterList;
            var regularExp = /^\d{8}[a-zA-Z]$/;
            //Se comprueba que el formato es válido
            if (regularExp.test(dni) === true) {
                //Número
                number = dni.substr(0, dni.length - 1);
                //Letra
                letter = dni.substr(dni.length - 1, 1);
                number = number % 23;
                letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                letterList = letterList.substring(number, number + 1);
                if (letterList !== letter.toUpperCase()) {
                    this._model.setProperty("/_DniState", "Error");
                } else {
                    this._model.setProperty("/_DniState", "None");
                    this.dataEmployeeValidation();
                }
            } else {
                this._model.setProperty("/_DniState", "Error");
            }
        }
    }


    function dataEmployeeValidation(oEvent, callback) {
        var object = this._model.getData();
        var isValid = true;

        if (!object.FirstName) {
            object._FirstNameState = "Error";
            isValid = false;
        } else {
            object._FirstNameState = "None";
        }


        if (!object.LastName) {
            object._LastNameState = "Error";
            isValid = false;
        } else {
            object._LastNameState = "None";
        }


        if (!object.CreationDate) {
            object._CreationDateState = "Error";
            isValid = false;
        } else {
            object._CreationDateState = "None";
        }


        if (!object.Dni) {
            object._DniState = "Error";
            isValid = false;
        } else {
            object._DniState = "None";
        }

        if (isValid) {
            this._wizard.validateStep(this.byId("PasoDatosEmpleado"));
        } else {
            this._wizard.invalidateStep(this.byId("PasoDatosEmpleado"));
        }

        if (callback) {
            callback(isValid);
        }
    }


    function wizardCompletedHandler(oEvent) {

        this.dataEmployeeValidation(oEvent, function (isValid) {
            if (isValid) {

                var wizardNavContainer = this.byId("navCreaEmpleado");

                wizardNavContainer.to(this.byId("Revision"));

                var uploadCollection = this.byId("UploadCollection");
                var files = uploadCollection.getItems();
                var numFiles = uploadCollection.getItems().length;
                this._model.setProperty("/_numFiles", numFiles);
                if (numFiles > 0) {
                    var arrayFiles = [];
                    for (var i in files) {
                        arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                    }
                    this._model.setProperty("/_files", arrayFiles);
                } else {
                    this._model.setProperty("/_files", []);
                }
            } else {
                this._wizard.goToStep(this.byId("PasoDatosEmpleado"));
            }
        }.bind(this));
    }




    function salvarEmpleado() {
        var data = this.getView().getModel().getData();
        var body = {};
        //Se obtienen aquellos campos que no empiecen por "_", ya que son los que vamos a enviar
        for (var i in data) {
            if (i.indexOf("_") !== 0) {
                body[i] = data[i];
            }
        }
        body.SapId = this.getOwnerComponent().SapId;
        body.UserToSalary = [{
            Amount: parseFloat(data._Salary).toString(),
            Comments: data.Comments,
            Waers: "EUR"
        }];


        this.getView().setBusy(true);

        this.getView().getModel("odataModel").create("/Users", body, {
            success: function (data) {
                this.getView().setBusy(false);

                this.newUser = data.EmployeeId;
                sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser, {
                    onClose: function () {

                        var wizardNavContainer = this.byId("navCreaEmpleado");
                        wizardNavContainer.back();

                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                        oRouter.navTo("RouteView", {}, true);
                    }.bind(this)
                });

                this.onStartUpload();
            }.bind(this),
            error: function () {
                this.getView().setBusy(false);
            }.bind(this)
        });
    }


    function cancelar() {

        sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("confirmaCancelar"), {
            onClose: function (oAction) {
                if (oAction === "OK") {

                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                    oRouter.navTo("RouteView", {}, true);
                }
            }.bind(this)
        });

    }


    function cambiar(oEvent) {
        var oUploadCollection = oEvent.getSource();

        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: this.getView().getModel("odataModel").getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
    }

    function onBeforeUploadStart(oEvent) {
        var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: this.getOwnerComponent().SapId + ";" + this.newUser + ";" + oEvent.getParameter("fileName")
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
    }

    function onStartUpload(ioNum) {
        var that = this;
        var oUploadCollection = that.byId("UploadCollection");
        oUploadCollection.upload();
    }

    return Controller.extend("logaligroup.empleado.controller.CreaEmpleado", {
        onBeforeRendering: onBeforeRendering,
        setearPasoUno: setearPasoUno,
        setearPasoDos: setearPasoDos,
        setearPasoTres: setearPasoTres,
        setearPaso: setearPaso,
        llamarPasoDos: llamarPasoDos,
        cambiar: cambiar, 
        cancelar: cancelar,
        salvarEmpleado: salvarEmpleado,
        validaDNI: validaDNI,
        dataEmployeeValidation: dataEmployeeValidation,
        wizardCompletedHandler: wizardCompletedHandler,
        onBeforeUploadStart: onBeforeUploadStart,
        onStartUpload: onStartUpload
    });

});