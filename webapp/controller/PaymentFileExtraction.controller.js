sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/app-bankinteg/controller/AppUI5",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/ButtonType",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment, Dialog, ButtonType, Button, Text, MessageBox, Export, ExportTypeCSV) {
	"use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.PaymentFileExtraction", {
		onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
		},

		onInit: function () {
			//get DataBase loggedin
			this.dataBase = jQuery.sap.storage.Storage.get("dataBase");
			this.userCode = jQuery.sap.storage.Storage.get("userCode");

			var oModelProd = new JSONModel("model/record.json");
			this.getView().setModel(oModelProd);

			//JSON model....
			var json = new JSONModel("model/record.json");
			//Setting model to view with alias name...
			//Alias name="tabAlias"....
			this.getView().setModel(json, "tabAlias");

			this.oExport = new JSONModel();
			// this.oMdlBank.setJSON("{\"allpnbbank\" : " + JSON.stringify(results) + "}");
			// this.getView().setModel(this.oMdlBank, "oMdlBank");

			this.oMdlPayExtract = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlPayExtract, "oMdlPayExtract");

			this.oMdlAP = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlAP");

			this.oMdlEditRecord = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
			// //CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			//GET ALL BATCHCODE
			this.oMdlBatch = new JSONModel();
			this.getAllRecords("getAllSavedBatch", "Batch");
			//CREATING MODEL SUPPLIER WITH OPEN AP
			this.oMdlBank = new JSONModel();
			this.getAllRecords("getAllBank", "Bank");
			//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			this.DocEntry = 0;
			this.BatchNumber = "";

			this.oMdlBPInfo = new JSONModel();
			// this.oMdlFileExport = new JSONModel();

			this.aCols = [];
			this.aColsDetails = [];
			this.columnData = [];
			this.columnDataDetail = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;
			this.oIconTab = this.getView().byId("tab1");
			this.oMdlAllRecord = new JSONModel();
			this.tableId = "tblDrafts";
			this.prepareTable(true);



		},
		//TABLE VIEW--------------------------------
		prepareTable: function (bIsInit) {

			var aResults = this.getHANAData("getAllSaveDrafts");

			if (aResults.length !== 0) {

				this.aCols = Object.keys(aResults[0]);
				var i;
				this.iRecordCount = aResults.length;
				this.oIconTab.setCount(this.iRecordCount);
				if (bIsInit) {
					for (i = 0; i < this.aCols.length; i++) {
						this.columnData.push({
							"columnName": this.aCols[i]
						});
					}
				}
				this.oMdlAllRecord.setData({
					rows: aResults,
					columns: this.columnData
				});
				if (bIsInit) {
					this.oTable = this.getView().byId(this.tableId);
					this.oTable.setModel(this.oMdlAllRecord);
					this.oTable.bindColumns("/columns", function (sId, oContext) {
						var columnName = oContext.getObject().columnName;
						return new sap.ui.table.Column({
							label: columnName,
							template: new sap.m.Text({
								text: "{" + columnName + "}"
							})
						});
					});
					this.oTable.bindRows("/rows");
					this.oTable.setSelectionMode("Single");
					this.oTable.setSelectionBehavior("Row");
					this.renameColumns();
				}

			}

		},
		renameColumns: function () {
			this.oTable.getColumns()[0].setLabel("Batch Number");
			this.oTable.getColumns()[0].setFilterProperty("U_App_DocNum");
			this.oTable.getColumns()[1].setLabel("Draft No.");
			this.oTable.getColumns()[2].setLabel("Status");
			this.oTable.getColumns()[3].setLabel("Created Date");
		},

		//GET ALL BATCHCODE
		getAllRecords: function (queryTag, Record) {
			// var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.dataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
					if (xhr.status === 400) {
						sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					} else {
						sap.m.MessageToast.show("Error");
					}
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					if (Record === "Batch") {
						this.oMdlBatch.setJSON("{\"allbatch\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlBatch, "oMdlBatch");
						// }else if(Record === "AllDrafts"){
						// 		if (results.length <= 0) {
						// 			aReturnResult = [];
						// 		} else {
						// 			aReturnResult = results;
						// 		}
					} else {
						this.oMdlBank.setJSON("{\"allpnbbank\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlBank, "oMdlBank");
					}
				}
			});
		},
		getHANAData: function (queryTag) {
			var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.dataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
					if (xhr.status === 400) {
						sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					} else {
						sap.m.MessageToast.show("Error");
					}
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;

		},
		onAdd: function (oEvent) {
			this.onClearAdd();
		},
		onClearAdd: function () {
			try {
				this.getView().byId("btnSearch").setVisible(true);
				this.getView().byId("btnPostDraft").setVisible(true);
				this.getView().byId("btnExport").setVisible(false);

				this.oMdlPayExtract.getData().EditRecord.DOCNUM = "";
				this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTO = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME = "";
				this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO = "";
				this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNAME = "";
				this.oMdlPayExtract.getData().EditRecord.REMARKS = "";
				this.oMdlPayExtract.refresh();

				this.getView().byId("DocumentNo").setEnabled(true);
				this.getView().byId("PrintingBranch").setEnabled(true);
				this.getView().byId("DispatchTo").setEnabled(true);
				this.getView().byId("DispatchToCode").setEnabled(true);
				this.getView().byId("PNBAccountNo").setEnabled(true);
				
				this.getView().byId("btnCancel").setVisible(false);
				this.getView().byId("btnSaveAsDraft").setVisible(true);

				this.oMdlAP.getData().allopenAP.length = 0;
				this.oMdlAP.refresh();

				this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
				var tab = this.getView().byId("idIconTabBarInlineMode");
				tab.setSelectedKey("tab2");

				this.bIsAdd = "A";
			} catch (err) {
				//console.log(err.message);
			}

		},
		onEdit: function (oEvent) {
			var iIndex = this.oTable.getSelectedIndex();
			//var sQueryTable = "M_TERMS_TEMPLATE";
			var DraftNum = "";
			var BatchNum = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				DraftNum = oRowSelected.U_App_DraftNo;

				BatchNum = oRowSelected.U_App_DocNum;
				BatchNum = BatchNum.split(',');
				BatchNum = JSON.stringify(BatchNum).replace("[", "").replace("]", "").replace(" ", "").replace(/"/g, "'");
				BatchNum = BatchNum.replace(" ", "");

				//AJAX selected Key
				$.ajax({
					url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.dataBase + "&procName=spAppBankIntegration&QUERYTAG=getSpecificDraft" +
						"&VALUE1=" + DraftNum + "&VALUE2=&VALUE3=&VALUE4=",
					type: "GET",
					async: false,
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
					},
					error: function (xhr, status, error) {
						MessageToast.show(error);
						if (xhr.status === 400) {
							sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
							sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
						} else {
							sap.m.MessageToast.show("Error");
						}
					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results.length <= 0) {
						return;
					}
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlPayExtract.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlPayExtract, "oMdlPayExtract");
					this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Record Code : " + this.oMdlPayExtract.getData().EditRecord
						.DOCENTRY + " [EDIT]");
				});

				var queryTag = "",
					value1 = "",
					value2 = "",
					value3 = "",
					value4 = "",
					dbName = "SBODEMOAU_SL";
				value1 = BatchNum;
				value2 = DraftNum;
				queryTag = "getBatchData";
				this.getSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
				this.oMdlAP.refresh();

				//Disable field in preview mode
				if (oRowSelected.U_App_Status === 'Draft') {
					this.getView().byId("btnPostDraft").setVisible(true);
					this.getView().byId("btnExport").setVisible(false);
					this.getView().byId("btnSaveAsDraft").setVisible(true);
					this.getView().byId("btnCancel").setVisible(false);
					
					this.getView().byId("DocumentNo").setEnabled(true);
					this.getView().byId("PrintingBranch").setEnabled(true);
					this.getView().byId("DispatchTo").setEnabled(true);
					this.getView().byId("DispatchToCode").setEnabled(true);
					this.getView().byId("PNBAccountNo").setEnabled(true);
					this.getView().byId("btnSearch").setVisible(true);
				} else {
					this.getView().byId("btnPostDraft").setVisible(false);
					this.getView().byId("btnExport").setVisible(true);
					this.getView().byId("btnSaveAsDraft").setVisible(false);
					this.getView().byId("btnCancel").setVisible(true);
					
					this.getView().byId("DocumentNo").setEnabled(false);
					this.getView().byId("PrintingBranch").setEnabled(false);
					this.getView().byId("DispatchTo").setEnabled(false);
					this.getView().byId("DispatchToCode").setEnabled(false);
					this.getView().byId("PNBAccountNo").setEnabled(false);
					this.getView().byId("btnSearch").setVisible(false);
				}
			}

			//this.recordCode = DocEntry;
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		onSelectionChangeDispatchTo: function (oEvent) {
			var str = this.getView().byId("DispatchToCode").getValue();
			var res = str.slice(7);
			this.getView().byId("DispatchToName").setValue(res);
			//MessageToast.show("onSelectionChangeTranType");
		},
		onExportFile: function (oEvent) {
			// this.getBPInfo(this.oMdlAP.getData().allopenAP[0].CardCode);
			this.exportData();
		},
		onSaveAsDraft: function (oEvent) {
			this.SavePostedDraft("", true);
		},
		onCancelTrans: function(oEvent){
			var oT_PAYMENT_EXTRACTING_H = {};
			var oT_PAYMENT_EXTRACTING_D = {};

			oT_PAYMENT_EXTRACTING_H.U_App_Status ="Cancelled";
			var batchArrayUpdate = [];
			var batchArray = [{
				"tableName": "U_APP_ODOP",
				"data": oT_PAYMENT_EXTRACTING_H,
				"Code" : this.oMdlPayExtract.getData().EditRecord.Code
			}];
			var code = "";
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				oT_PAYMENT_EXTRACTING_D.Cancelled = 'Y';

				batchArrayUpdate.push(JSON.parse(JSON.stringify(({
					"tableName": "PaymentDrafts",
					"data": oT_PAYMENT_EXTRACTING_D,
					"DocEntry" : this.oMdlAP.getData().allopenAP[d].DraftDocEntry
				}))));
			}
			var sBodyRequest = this.prepareBatchRequestBody(batchArray,batchArrayUpdate);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if (results) {
					MessageToast.show("Cancelled Transaction!");
					this.prepareTable(false);
				}
			});
			
		},
		onPostDraftOP: function (oEvent) {
			if (!this.checkIfBlankField()) {
				return;
			}
			var oRecord = {};
			var oPaymentInvoices = {};
			oRecord.PaymentChecks = [];
			oRecord.PaymentInvoices = [];
			oRecord.CashFlowAssignments = [];
			var batchArray = [];
			//header
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				oRecord.DocType = "rSupplier";
				oRecord.HandWritten = "tNO";
				oRecord.Printed = "tNO";
				oRecord.DocDate = this.getTodaysDate;
				oRecord.CardCode = this.oMdlAP.getData().allopenAP[d].CardCode;
				oRecord.CardName = this.oMdlAP.getData().allopenAP[d].CardName;
				oRecord.Address = null;
				oRecord.CashAccount = null;
				oRecord.DocCurrency = this.oMdlAP.getData().allopenAP[d].DocCur;

				oRecord.CheckAccount = 161020;
				oRecord.Remarks = null;
				oRecord.Series = 15;
				oRecord.TransactionCode = "";
				oRecord.PaymentType = "bopt_None";
				oRecord.TransferRealAmount = 0.0;
				oRecord.DocObjectCode = "bopot_OutgoingPayments";
				oRecord.DocTypte = "rSupplier";
				oRecord.DueDate = this.getTodaysDate; //"2020-02-06";
				var Total = 0;
				// for (var i = 0; i < this.oMdlAP.getData().allopenAP.length; i++) {
				// if (this.oMdlAP.getData().allopenAP[d].CardCode === this.oMdlAP.getData().allopenAP[i].CardCode) {
				oPaymentInvoices.LineNum = 0;
				oPaymentInvoices.DocEntry = this.oMdlAP.getData().allopenAP[d].DocEntry;
				oPaymentInvoices.SumApplied = this.oMdlAP.getData().allopenAP[d].PaymentAmount; //55.0;
				oPaymentInvoices.AppliedFC = 0.0;
				oPaymentInvoices.AppliedSys = this.oMdlAP.getData().allopenAP[d].PaymentAmount; //55.0;
				oPaymentInvoices.DocRate = 0.0;
				oPaymentInvoices.DocLine = 0;
				oPaymentInvoices.InvoiceType = "it_PurchaseInvoice";
				oPaymentInvoices.DiscountPercent = 0.0;
				oPaymentInvoices.PaidSum = 0.0;
				oPaymentInvoices.InstallmentId = 1;
				oPaymentInvoices.WitholdingTaxApplied = 0.0;
				oPaymentInvoices.WitholdingTaxAppliedFC = 0.0;
				oPaymentInvoices.WitholdingTaxAppliedSC = 0.0;
				oPaymentInvoices.LinkDate = null;
				oPaymentInvoices.DistributionRule = null;
				oPaymentInvoices.DistributionRule2 = null;
				oPaymentInvoices.DistributionRule3 = null;
				oPaymentInvoices.DistributionRule4 = null;
				oPaymentInvoices.DistributionRule5 = null;
				oPaymentInvoices.TotalDiscount = 0.0;
				oPaymentInvoices.TotalDiscountFC = 0.0;
				oPaymentInvoices.TotalDiscountSC = 0.0;
				Total = Total + this.oMdlAP.getData().allopenAP[d].PaymentAmount;
				oRecord.PaymentInvoices.push(JSON.stringify(oPaymentInvoices));
				// counter = i;
				// }
				// }
				Array.prototype.push.apply(oRecord.PaymentInvoices);
				oRecord.CashSum = Total;

				batchArray.push(JSON.parse(JSON.stringify(({
					"tableName": "PaymentDrafts",
					"data": oRecord
				}))));
				// this.PostPaymentDraft(oRecord);
			}
			var sBodyRequest = this.prepareBatchRequestBody(batchArray,false);
			$.ajax({
				url: "https://18.136.35.41:5000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					jQuery.sap.log.debug(json);
				},
				context: this

			}).done(function (results) {
				if (results) {
					var re = /\(([^)]+)\)/g;
					var s = results;
					var m;
					var a = {};
					var DocEntries = [];
					do {
						m = re.exec(s);
						if (m) {
							a.docentry = m[1];
							DocEntries.push(a.docentry);
						}
					} while (m);
					for (var i = 0; i < DocEntries.length; i++) {
						this.updateDraft(DocEntries[i]);
					}
					this.SavePostedDraft(DocEntries, false);
					//this.exportData();
					sap.m.MessageToast.show("Successfully posted Draft Outgoing Payment!");
					this.onClearAdd();
					this.oMdlAllRecord.refresh();
					this.prepareTable(false);
				}
			});
		},
		onSearch: function (oEvent) {
			var queryTag = "",
				value1 = "",
				value2 = 0,
				value3 = "",
				value4 = "",
				dbName = "SBODEMOAU_SL";
			var a = this.getView().byId("DocumentNo").getValue();
			var b = a.split(',');
			var c = JSON.stringify(b).replace("[", "").replace("]", "").replace(" ", "").replace(/"/g, "'");
			this.BatchNumber = a.replace(" ", "").split(",");

			value1 = c.replace(" ", "");
			queryTag = "getBatchData";
			this.getSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
		},
		//search------------
		getSearchDataDet: function (dbName, procName, queryTag, value1, value2, value3, value4) {
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.dataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=" + value1 + "&VALUE2=" + value2 + "&VALUE3=" + value3 + "&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlAP.setJSON("{\"allopenAP\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAP, "oMdlAP");
				}
			});
		},
		PostPaymentDraft: function (oRecord) {
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts",
				type: "POST",
				contentType: "application/json",
				async: false,
				data: JSON.stringify(oRecord),
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					sap.m.MessageToast.show("Saved to Out Going Payment Draft. ");
				},
				context: this

			}).done(function (results) {
				if (results) {
					this.DocEntry = results.DocEntry;
					sap.m.MessageToast.show("Saved to Out Going Payment Draft. ");
				}
			});
		},
		//Update Draft
		updateDraft: function (DocEntry) {
			var Data;
			var oT_PAYMENT_PROCESSING_H = {};
			oT_PAYMENT_PROCESSING_H.U_App_DraftNo = DocEntry;
			Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);

			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts(" + DocEntry + ")",
				type: "PATCH",
				contentType: "application/json",
				async: false,
				data: Data,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if (results) {}
			});
		},
		//end Update Draft
		//get bp info
		getBPInfo: function (CardCode) {
			var that = this;
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/BusinessPartners?$select=CardName,CardCode,Address,FederalTaxID,ZipCode&$filter=CardCode eq '" +
					CardCode + "'",
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlBPInfo.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlBPInfo, "oMdlBPInfo");
					// that.prepareTable(false);
					this.exportData(oResult);
					//return results;
				}
			});
		},
		//get bp info----

		//Saving of Posted Draft
		SavePostedDraft: function (DocEntry, isDraft) {

			var CodeH = AppUI5.generateUDTCode("GetCode");
			var DraftNo = AppUI5.generateUDTCode("GetDraftNo");
			var oT_PAYMENT_EXTRACTING_H = {};
			var oT_PAYMENT_EXTRACTING_D = {};

			oT_PAYMENT_EXTRACTING_H.Code = CodeH;
			oT_PAYMENT_EXTRACTING_H.Name = CodeH;
			// oT_PAYMENT_EXTRACTING_H.U_App_DocEntry = DocEntry ;//this.DocEntry;
			oT_PAYMENT_EXTRACTING_H.U_App_DocNum = this.oMdlPayExtract.getData().EditRecord.DOCNUM; //'BFI202001292017_007';//
			oT_PAYMENT_EXTRACTING_H.U_App_PNBPrntBrnch = this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH; //'4053'; //
			oT_PAYMENT_EXTRACTING_H.U_App_DistPatchTo = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTO; //BN - Customer'; //
			oT_PAYMENT_EXTRACTING_H.U_App_DispatchCode = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE; //'4053'; // 
			oT_PAYMENT_EXTRACTING_H.U_App_DispatchName = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME; //'PNB GSC Santiago Branch'; //
			oT_PAYMENT_EXTRACTING_H.U_App_PNBAccountNo = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO; //'RBA'; //
			oT_PAYMENT_EXTRACTING_H.U_App_PNBAccountName = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNAME; //'12398726'; //
			oT_PAYMENT_EXTRACTING_H.U_App_Remarks = ""; //this.oMdlPayExtract.getData().EditRecord.Remarks;
			oT_PAYMENT_EXTRACTING_H.U_App_Status = (!isDraft ? "Posted Draft Document" : "Draft");
			oT_PAYMENT_EXTRACTING_H.U_App_DraftNo = DraftNo;
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedBy = this.userCode;
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedDate = this.getTodaysDate();

			var batchArray = [{
				"tableName": "U_APP_ODOP",
				"data": oT_PAYMENT_EXTRACTING_H
			}];
			var code = "";
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				code = AppUI5.generateUDTCode("GetCode");
				oT_PAYMENT_EXTRACTING_D.Code = code;
				oT_PAYMENT_EXTRACTING_D.Name = code;
				oT_PAYMENT_EXTRACTING_D.U_App_DocNum = this.oMdlAP.getData().allopenAP[d].BatchNum;
				oT_PAYMENT_EXTRACTING_D.U_App_DocEntry = (!isDraft ? DocEntry[d] : "");
				oT_PAYMENT_EXTRACTING_D.U_App_DraftNo = DraftNo;
				oT_PAYMENT_EXTRACTING_D.U_App_InvDocNum = this.oMdlAP.getData().allopenAP[d].DocNum;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedBy = this.userCode;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedDate = this.getTodaysDate();
 
				batchArray.push(JSON.parse(JSON.stringify(({
					"tableName": "U_APP_DOP1",
					"data": oT_PAYMENT_EXTRACTING_D
				}))));
			}
			var sBodyRequest = this.prepareBatchRequestBody(batchArray,false);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if (results) {
					if (isDraft) {
						MessageToast.show("Saved as Draft!");
						this.onClearAdd();
						this.oMdlAllRecord.refresh();
						this.prepareTable(false);
					}
				}
			});
		},
		exportData: function (DraftResults) {

			this.oRecord= {};
			this.oRecord.Details= [];
			this.Content={};
			this.dataObject= {};
			// var PayeeName;
			// var PayeeCode;
			// var TIN;
			// var ZipCode;
			// var Address;
			// var test;
							
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				var TotalCheck = 1;
				var PayeeName = this.oMdlAP.getData().allopenAP[d].CardName;
				var Address = (this.oMdlAP.getData().allopenAP[d].Address === null ? "" :  this.oMdlAP.getData().allopenAP[d].Address);
				var Address2 = "";
				var TIN = (this.oMdlAP.getData().allopenAP[d].TIN === null ? "" :  this.oMdlAP.getData().allopenAP[d].TIN);
				var ZipCode = (this.oMdlAP.getData().allopenAP[d].ZipCode === null ? "" :  this.oMdlAP.getData().allopenAP[d].ZipCode);
				var PayeeCode =this.oMdlAP.getData().allopenAP[d].CardCode;//results.CardCode;
				var PNBAccountNo = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO;//'RBA'; //
				var today = new Date();
				var date = ("0" + today.getDate()).slice(-2) + '/' + ("0" + (today.getMonth() + 1)).slice(-2) + '/' +  today.getFullYear().toString().substr(-2);
				var PrintingBranch = this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH;//'4053'; //
				var dispatchMode= "O";
				var DispatchTo = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE;//'4053'; // 
				var DispatchCode = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE;
				var DispatchToName = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME;//'PNB GSC Santiago Branch'; //
				var fileRefNo = this.DocEntry;
				var WHTApplicable = "";
				var WHTTaxCode = "";
				var WHTTaxRate = "";
				var VATApplicable  = "";
				var WHTDateBaseAmount = "";
				var totalAmount = 0;
				var RecordIdentifier = "I";
				var InvoiceNo  = this.oMdlAP.getData().allopenAP[d].DocNum;
				var InvoiceDate = this.oMdlAP.getData().allopenAP[d].DocDate;
				var year = InvoiceDate.substring(0, 4);
				var month = InvoiceDate.substring(4, 6);
				var day = InvoiceDate.substring(6, 8);

				 InvoiceDate =  month + '/' + day + '/' + year.toString().substr(-2) ;

				var Desc = this.oMdlAP.getData().allopenAP[d].Dscription;
				var InvoiceAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;
				var InvoiceWHTAmount = "";
				var InvoiceVATAmount = "";
				var InvoiceNetAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;

				this.Content.Details = "D" + "~" + InvoiceAmount.toFixed(2) + "~" + PayeeName  + "~" + Address  + "~" + Address2
										+ "~" + TIN + "~" + ZipCode + "~" + PayeeCode + "~" + PNBAccountNo	+ "~" + date + "~" + PrintingBranch
										+ "~" + dispatchMode + "~" + DispatchTo + "~" + DispatchCode + "~" + DispatchToName 
										+ "~" + fileRefNo + "~" + WHTApplicable + "~" + WHTTaxCode + "~" + WHTTaxRate 
										+ "~" + VATApplicable + "~" + WHTDateBaseAmount;
				this.oRecord.Details.push(JSON.parse(JSON.stringify(this.Content)));

				this.Content.Details = RecordIdentifier + "~" + InvoiceNo + "~" + InvoiceDate + "~" + Desc
									   + "~" + InvoiceAmount.toFixed(2) + "~" + InvoiceWHTAmount + "~" + InvoiceVATAmount
									   + "~" + InvoiceNetAmount.toFixed(2);
				 totalAmount = totalAmount + InvoiceAmount ;
				 this.oRecord.Details.push(JSON.parse(JSON.stringify(this.Content)));

				// this.Content.Details = RecordIdentifier + "~" + InvoiceNo + "~" + InvoiceDate + "~" + Desc
				// 					   + "~" + InvoiceAmount + "~" + InvoiceWHTAmount + "~" + InvoiceVATAmount
				// 					   + "~" + InvoiceNetAmount;
				//  totalAmount = totalAmount + InvoiceAmount ;
				//  this.oRecord.Details.push(JSON.parse(JSON.stringify(this.Content)));

				 //this.oRecord.Details.push(JSON.parse(JSON.stringify(this.header)),JSON.parse(JSON.stringify(this.Details)));
			}
			this.oMdlFileExport = new JSONModel(this.oRecord);
			this.getView().setModel(this.oMdlFileExport, "oMdlFileExport");
			this.handleExcelExport(this.oRecord);

		},

		checkIfBlankField: function () {
			if (this.getView().byId("DocumentNo").getValue() === "") {
				MessageToast.show("Please choose batch!");
				return false;
			} else if (this.getView().byId("PrintingBranch").getValue() === "") {
				MessageToast.show("Please choose Printing Branch!");
				return false;
			} else if (this.getView().byId("DispatchTo").getValue() === "") {
				MessageToast.show("Please choose Dispatch to!");
				return false;
			} else if (this.getView().byId("DispatchToCode").getValue() === "") {
				MessageToast.show("Please choose Dispatch to Code!");
				return false;
			} else if (this.getView().byId("PNBAccountNo").getValue() === "") {
				MessageToast.show("Please choose PNB Account!");
				return false;
			}
			return true;
		},
		//Saving of Posted Draft
		//Batch Fragment
		// handleValueHelpBatch: function () {
		// 	if (!this._oValueHelpDialogs) {
		// 		Fragment.load({
		// 			name: "com.apptech-experts.BFI_BANKINTEG.view.fragments.BatchDialogFragment",
		// 			controller: this
		// 		}).then(function (oValueHelpDialogs) {
		// 			this._oValueHelpDialogs = oValueHelpDialogs;
		// 			this.getView().addDependent(this._oValueHelpDialogs);
		// 			this._configValueHelpDialogs();
		// 			this._oValueHelpDialogs.open();
		// 		}.bind(this));
		// 	} else {
		// 		this._configValueHelpDialogs();
		// 		this._oValueHelpDialogs.open();
		// 	}
		// },
		// _configValueHelpDialogs: function () {
		// 	var sInputValue = this.byId("DocumentNo").getValue(),
		// 		oModel = this.getView().getModel("oMdlBatch"),
		// 		aList = oModel.getProperty("/allbatch");

		// 	aList.forEach(function (oRecord) {
		// 		oRecord.selected = (oRecord.U_App_DocNum === sInputValue);
		// 	});
		// },
		// handleSearchBatch: function(oEvent) {
		// 	var sValue = oEvent.getParameter("value");
		// 	var oFilter = new Filter("U_App_DocNum", FilterOperator.Contains, sValue);
		// 	var oBinding = oEvent.getSource().getBinding("items");
		// 	oBinding.filter([oFilter]);
		// },
		// handleValueHelpCloseBatch: function (oEvent) {
		// 	var aContexts = oEvent.getParameter("selectedContexts");
		// 	var BatchDetails = {};
		// 	if (aContexts && aContexts.length) {
		// 		BatchDetails = aContexts.map(function (oContext) {
		// 			var oBatch = {};
		// 			oBatch.U_App_DocNum = oContext.getObject().U_App_DocNum;
		// 			oBatch.U_App_SupplierName = oContext.getObject().U_App_SupplierName;
		// 			return oBatch;
		// 		});
		// 	}
		// 	oEvent.getSource().getBinding("items").filter([]);
		// 	this.getView().byId("DocumentNo").setValue(BatchDetails[0].U_App_DocNum);
		// 	this.oMdlEditRecord.refresh();
		// },
		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oDialog) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.BatchDialogFragment",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel("oMdlBatch"));
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function (oButton) {
			// Multi-select if required
			var bMultiSelect = true;
			this._oDialog.setMultiSelect(bMultiSelect);
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable == "true");
			// Set draggable property
			var bResizable = oButton.data("resizable");
			this._oDialog.setResizable(bResizable == "true");

			// Set style classes
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var sResponsivePadding = oButton.data("responsivePadding");
			if (sResponsivePadding) {
				this._oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				this._oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		handleSearchs: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("U_App_DocNum", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				this.getView().byId("DocumentNo").setValue(aContexts.map(function (oContext) {
					return oContext.getObject().U_App_DocNum;
				}).join(", "));
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
					return oContext.getObject().U_App_DocNum;
				}).join(", "));
			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleValueHelp: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.view.ValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialogs();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogs();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialogs: function () {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel("oMdlBatch"),
				aBatch = oModel.getProperty("/allbatch");

			aBatch.forEach(function (oBatch) {
				oBatch.selected = (oBatch.U_App_DocNum === sInputValue);
			});
			oModel.setProperty("/allbatch", aBatch);
		},
		handleValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("productInput");
			if (oSelectedItem) {
				this.byId("productInput").setValue(oSelectedItem.getTitle());
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		//Batch Fragment---------------
		//Bank FRAGMENT -------------------
		handleValueHelpBank: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.BankDialogFragment",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialog: function () {
			var sInputValue = this.byId("PNBAccountNo").getValue(),
				oModel = this.getView().getModel("oMdlBank"),
				aList = oModel.getProperty("/allpnbbank");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.BankCode === sInputValue);
			});
		},
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("BankCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleValueHelpCloseBank: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var BankDetails = {};
			if (aContexts && aContexts.length) {
				BankDetails = aContexts.map(function (oContext) {
					var oBankDetails = {};
					oBankDetails.PNBAccountNo = oContext.getObject().BankCode;
					oBankDetails.PNBAccountName = oContext.getObject().Account;
					return oBankDetails;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("PNBAccountNo").setValue(BankDetails[0].PNBAccountName);
			this.getView().byId("PNBAccountName").setValue(BankDetails[0].PNBAccountNo);
			this.oMdlEditRecord.refresh();
		},
		//Bank FRAGMENT -------------------
		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date;
		},
		// generateUDTCode: function (docType) {

		// 	var generatedCode = "";

		// 	$.ajax({
		// 		url: "/BiotechXSJS/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=SPAPP_GENERATENUMBER&DocType="+ docType,
		// 		type: "GET",
		// 		async: false,
		// 		xhrFields: {
		// 			withCredentials: true
		// 		},
		// 		error: function (xhr, status, error) {
		// 			// if (xhr.status === 400) {
		// 			// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
		// 			// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
		// 			// }else{
		// 			// 	sap.m.MessageToast.show(error);
		// 			// }
		// 			sap.m.MessageToast.show(error);
		// 		},
		// 		success: function (json) {
		// 			generatedCode = json[0][""];

		// 		},
		// 		context: this
		// 	}).done(function (results) {
		// 		if (results) {
		// 			if (docType === "GetLastBatchOfDay"){
		// 				generatedCode = results[0]["Code"];
		// 			}else{
		// 				generatedCode = results[0][""];
		// 			}
		// 		}
		// 	});
		// 	return generatedCode;
		// },
		prepareBatchRequestBody: function (oRequest,oRequestUpdate) {

			var batchRequest = "";

			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;
			
			if (oRequestUpdate !== false){
				//Update
				//Update UDT
				for (var i = 0; i < oRequest.length; i++) {

					objectUDT = oRequest[i];
					batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					batchRequest = batchRequest + "PATCH /b1s/v1/"  + objectUDT.tableName + "('"+ objectUDT.Code +"')";
					batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
					batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
				}
				//update Draft Document	
				var objectUDTUpdate = "";
				for (var i = 0; i < oRequestUpdate.length; i++) { 
	
					objectUDTUpdate = oRequestUpdate[i];
					batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					batchRequest = batchRequest + "PATCH /b1s/v1/"  + objectUDTUpdate.tableName + "("+ objectUDTUpdate.DocEntry +")";
					batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
					batchRequest = batchRequest + JSON.stringify(objectUDTUpdate.data) + "\n\n";
				}
			}else{
				//POST
				var objectUDT = "";
				for (var i = 0; i < oRequest.length; i++) {
	
					objectUDT = oRequest[i];
					batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
					batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
					batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
				}
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},
		//Exporting of data to txt file
		handleExcelExport: function (header, details) {
			//Generate text file name
			var fileName;
			var costumerCode = "1131141";
			var today = new Date();
			var date = ("0" + (today.getMonth() + 1)).slice(-2) + '' + ("0" + today.getDate()).slice(-2) + '' + today.getFullYear().toString().substr(-
				2);
			var LastBatch = AppUI5.generateUDTCode("GetLastBatchOfDay");
			if (LastBatch === "0") {
				LastBatch = 1;
			}
			var pad = "000";
			var result = (pad + LastBatch).slice(-pad.length);

			fileName = "EC" + costumerCode + date + result;
			//Generate text file name

			// getting model into oModel variable.
			var oModel = this.getView().getModel("oMdlFileExport"); //this.getView().getModel("oMdlFileExport");

			var aTextFileExport = this.getView().getModel("oMdlFileExport").getData().Details;
			onSaveTextFile(aTextFileExport,fileName);
			return;

			// comment for meantime
			// var oExport = new Export({
			// exportType: new ExportTypeCSV({
			// 	// for xls....
			// 	fileExtension: "txt",
			// 	separatorChar: "\t",
			// 	charset: "utf-8",
			// 	mimeType: "application/vnd.ms-excel"
			// }),
			// models: oModel,

			// rows: {
			// 	path: "/Details"
			// }
			// ,
			// columns: {
			// 	// name: 1,
			// 	template: {
			// 	content: "{Details}"
			// 	}
			// }
			// });

			// oExport.saveFile(fileName).catch(function (oError) {
			// 	sap.m.MessageToast.show("Generate is not possible beause no model was set");
			// }).then(function () {
			// 	oExport.destroy();
			// });
		}

	});
	function onSaveTextFile(aBlob,fileName) {
		var aBlobString = aBlob.map(a => a.Details+"\n");
		var blob = new Blob(aBlobString, {
			type: "text/plain;charset=utf-8"
		});
		saveAs(blob, fileName);
	}
});
