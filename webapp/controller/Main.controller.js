sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller,
    XMLView,
    JSONModel,
    MessageToast) => {
    "use strict";
    var filterData = [];
    return Controller.extend("ronesans.myinbox.controller.Main", {

        onInit() {
            this.getData("484743");
            this.onPieChartInit();
            this.onTableInit();
        },
        onPieChartInit: function () {
            this.aSelectedData = [];
            var that = this;

            var oVizFrame = this.getView().byId("idVizFrame");
            oVizFrame.setVizProperties({
                title: {
                    visible: false
                },
                plotArea: {
                    dataLabel: {
                        visible: true,
                    }
                },
                legend: {
                    visible: true,
                    title: {
                        visible: false
                    }
                }


            });
        },
        onTableInit: function () {
            var filterModel = {
                surecList: [],
                surec: []
            };
            this.getView().setModel(new JSONModel(filterModel), "filterList");
        },

        setChartData: function () {
            var oModel = this.getView().getModel("mainModel");
            var oSayac = {}
            oModel.getProperty("/surecListesi").forEach(item => {
                const surec = item.Surec;
                if (oSayac[surec]) {
                    oSayac[surec]++;
                } else {
                    oSayac[surec] = 1;
                }
            });

            const aSurecToplam = Object.keys(oSayac).map(surec => {
                return {
                    "Surec": oSayac[surec] + " / " + surec,
                    "Toplam": oSayac[surec]
                };
            });
            oModel.setProperty("/pieList", aSurecToplam)
            oModel.refresh(true);

        },

        getData: function (sSicilNo) {
            const oModel = this.getOwnerComponent().getModel();
            const oView = this.getView();

            oView.setModel(new JSONModel(), "mainModel");

            const oFilter = new sap.ui.model.Filter("IvSicil", sap.ui.model.FilterOperator.EQ, sSicilNo);

            oModel.read("/MyInboxFullListSet", {
                filters: [oFilter],
                success: function (data) {
                    this.getView().getModel("mainModel").setProperty("/surecListesi", data.results);
                    this.setChartData();
                    this.setFilterData();
                }.bind(this),
                error: function (error) {
                    console.warn(error);
                }
            });
        },
        setFilterData: function () {
            var oModelData = this.getView().getModel("mainModel").getProperty("/surecListesi");

            var aSurecList = [];

            oModelData.forEach(function (item) {
                const surec = item.Surec;
                const exists = aSurecList.some(function (obj) {
                    return obj.key === surec;
                });

                if (!exists) {
                    aSurecList.push({ key: surec, value: surec });
                }
            });

            this.getView().getModel("filterList").setProperty("/surecList", aSurecList)

        },
        onPressOpenLink: function (oEvent) {
            const sUrl = oEvent.getSource().getBindingContext("mainModel").getObject().Link;

            if (sUrl) {
                window.open(sUrl, "_blank");
            } else {
                MessageToast.show("Link bulunamadı.");
            }
        },
        onSurecSelectionChange: function (oEvent) {
            var aSelectedSurec = this.getView().getModel("filterList").getProperty("/surec");
            var aAllData = this.getView().getModel("mainModel").getProperty("/pieList");

            var aFilteredData = [];
            aAllData.forEach(function (item) {
                if (aSelectedSurec.indexOf(item.Surec.split(" / ")[1]) !== -1) {
                    aFilteredData.push({
                        data: {
                            Surec: item.Surec,
                            Toplam: item.Toplam
                        }
                    });
                }
            });

            const oVizFrame = this.byId("idVizFrame");
            const oData = this.getView().getModel("filterList");

            oVizFrame.vizSelection(aFilteredData, { clearSelection: true });

        },
        onFilterBarSearch: function (oEvent) {
            var oFilterBar = this.byId("filterbar");
            var oModel = this.getView().getModel("filterList");
            var selectedSurec = oModel.getProperty("/surec");

            var oTable = this.byId("idTable");

            var aFilters = [];
            var aSurecFilters = [];

            if (selectedSurec && selectedSurec.length > 0) {
                selectedSurec.forEach(function (surec) {
                    var oSurecFilter = new sap.ui.model.Filter("Surec", sap.ui.model.FilterOperator.EQ, surec);
                    aSurecFilters.push(oSurecFilter);
                });
            }
            if (aSurecFilters.length > 0) {
                var oSurecFinalFilter = new sap.ui.model.Filter(aSurecFilters, false);
                aFilters.push(oSurecFinalFilter);
            }

            
                var oFinalFilter = new sap.ui.model.Filter(aFilters, true);

                var oBinding = oTable.getBinding("items");
                oBinding.filter(oFinalFilter);
            

        },
        onUpdateFinished: function () {
            const oTable = this.byId("idTable");
            const oItems = oTable.getItems();
        
            oItems.forEach((item) => {
                const domRef = item.getDomRef();
                if (domRef) {
                    domRef.classList.add("fade-in");
        
                    
                    setTimeout(() => {
                        domRef.classList.remove("fade-in");
                    }, 400);
                }
            });
        },
        dayFormatter: function (text) {
            return text + " gün";
        }
    });
});