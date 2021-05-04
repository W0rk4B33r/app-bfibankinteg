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
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment, Dialog, ButtonType, Button, Text, MessageBox) {
	"use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.ReturnFileUploading", {

        onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
		},

		onInit: function () {
			this.oMdlUploading = new JSONModel("model/returnfileuploading.json");
			this.getView().setModel(this.oMdlUploading, "oMdlUploading");
			
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");
			this.sUserCode = jQuery.sap.storage.Storage.get("userCode");
			
			//getButtons
			this.oMdlButtons = new JSONModel();
			this.oResults = AppUI5.fGetButtons(this.sDataBase,this.sUserCode,"returnfileuploading");
			var newresult = [];
				this.oResults.forEach((e)=> {
					var d = {};
					d[e.U_ActionDesc] = JSON.parse(e.visible);
					newresult.push(JSON.parse(JSON.stringify(d)));
				});
			var modelresult = JSON.parse("{" + JSON.stringify(newresult).replace(/{/g,"").replace(/}/g,"").replace("[","").replace("]","") + "}");
			this.oMdlButtons.setJSON("{\"buttons\" : " + JSON.stringify(modelresult) + "}");
			this.getView().setModel(this.oMdlButtons, "buttons");
			this.iRecordCount = 0;
		},
		FileUpload: function(oEvent){
			this.oMdlUploading.getData().Uploading.length = 0;

			var oFileUploader = this.getView().byId("fileUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var file = domRef.files[0];
			var that = this;
			this.fileName = file.name;
			this.fileType = file.type;
			var reader = new FileReader();
			reader.onload = function(e){
				var arrTxt = e.currentTarget.result.split("\n");
				var oData = [];
				var record = {};

				for (var d = 0; d < arrTxt.length ; d++) {
					var arrRecord = arrTxt[d].split("~");

					record.CheckAmount = arrRecord[1];
					record.CheckNum = arrRecord[2];
					record.VoucherNum = arrRecord[3];
					record.SupplierCode =arrRecord[5];
					record.SupplierName = arrRecord[4];
					record.BankAccount = arrRecord[6];
					record.PaymentDate = arrRecord[7];
					record.CheckDate = arrRecord[8];
					record.RefNum = arrRecord[9];
					oData.push(JSON.parse(JSON.stringify(record)));
				}
				that.getView().getModel("oMdlUploading").setProperty("/Uploading", oData);
			};
			reader.readAsBinaryString(file);
			
		},
		PostOutGoingPayment: function(oEvent){
			this.iRecordCount = this.oMdlUploading.getData().Uploading.length;
			for (var d = 0; d < this.oMdlUploading.getData().Uploading.length ; d++) {
				var sDocEntry;
				var oRecord = {};
				var oPaymentChecks = {};
				var oPaymentInvoices = {};
				var oCashFlowAssignments = {};
				oRecord.PaymentChecks = [];
				oRecord.PaymentInvoices = [];
				oRecord.CashFlowAssignments = [];
				var todayDate =new Date(Date.parse(this.oMdlUploading.getData().Uploading[d].PaymentDate));
				var year = todayDate.getFullYear();
				var month = todayDate.getMonth() + 1;
				var date = todayDate.getDate();
				var stringDate = `${year}-${month.toString().padStart(2,"0")}-${date.toString().padStart(2,"0")}`;

					//header
					oRecord.DocDate = stringDate;
					oRecord.CounterReference = this.oMdlUploading.getData().Uploading[d].VoucherNum;
					// oRecord.U_APP_IsPosted = "N";
					oRecord.CashSum = 0.0;
					sDocEntry = this.oMdlUploading.getData().Uploading[d].RefNum.replace(" ","");
					//for (var d = 0; d < this.oMdlUploading.getData().Uploading.length; d++) {
						// //check details
						var stodayDate =new Date(Date.parse(this.oMdlUploading.getData().Uploading[d].CheckDate));
						var syear = stodayDate.getFullYear();
						var smonth = stodayDate.getMonth() + 1;
						var sdate = stodayDate.getDate();
						var sStringDate = `${syear}-${smonth.toString().padStart(2,"0")}-${sdate.toString().padStart(2,"0")}`;

						oPaymentChecks.LineNum = 0;
						oPaymentChecks.DueDate = sStringDate;
						//new Date(Date.parse(this.oMdlUploading.getData().Uploading[d].CheckDate));//this.oMdlUploading.getData().Uploading[d].CheckDate;// "2020-02-06";
						var oCheckNum = this.oMdlUploading.getData().Uploading[d].CheckNum;
						var CheckNumLength = oCheckNum.length;
						oPaymentChecks.CheckNumber = (oCheckNum.length < 9 ? oCheckNum : oCheckNum.substring(CheckNumLength - 9)); //1234;
						oPaymentChecks.BankCode = "PNB";
						//oPaymentChecks.Branch = "123-0129";//"803-279";
						oPaymentChecks.AccounttNum = this.oMdlUploading.getData().Uploading[d].BankAccount;//"23058023";
						oPaymentChecks.Details = null;
						oPaymentChecks.Trnsfrable = "tNO";
						oPaymentChecks.CheckSum = this.oMdlUploading.getData().Uploading[d].CheckAmount;//319.0;
						oPaymentChecks.Currency = "PHP";
						oPaymentChecks.CountryCode = "PH";
						oPaymentChecks.CheckAbsEntry = null;
						//oPaymentChecks.CheckAccount =this.oMdlUploading.getData().Uploading[d].PaymentDate;// "161020";
						oPaymentChecks.ManualCheck = "tYES";
						oPaymentChecks.FiscalID = null;
						oPaymentChecks.OriginallyIssuedBy = null;
						oPaymentChecks.Endorse = "tNO";
						oPaymentChecks.EndorsableCheckNo =  null;
					
					oRecord.PaymentChecks.push(oPaymentChecks);
					//}
				this.fUpdatePaymentDraft(oRecord,sDocEntry,d);
			}
		},
		fUpdatePaymentDraft: function(oRecord,sDocEntry,iIndex){
			$.ajax({

				url: "https://sl-eut.biotechfarms.net/b1s/v1/PaymentDrafts("+ sDocEntry + ")",
				type: "PATCH",
				contentType: "application/json",
				data: JSON.stringify(oRecord), //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;		
					AppUI5.fErrorLogs("PaymentDrafts","Post Outgoing","null","null",Message,"Bank Integ Payment Uploading",this.sUserCode,"null",JSON.stringify(oRecord));	
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {
					this.PostOutgoing(sDocEntry,iIndex);
				},
				context: this

			}).done(function (results) {
				if (results) {
					//this.DocEntry = results.DocEntry;
					 sap.m.MessageToast.show("Saved to Out Going Payment Draft. " );
					//this.PostOutgoing();
				}
			});
		},
		PostOutgoing: function(sDocEntry,iIndex){
			$.ajax({

				url: "https://sl-eut.biotechfarms.net/b1s/v1/PaymentDrafts("+ sDocEntry + ")/SaveDraftToDocument",
				type: "POST",
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;	
					AppUI5.fErrorLogs("PaymentDrafts","Post Outgoing","null","null",Message,"Bank Integ Payment Uploading",this.sUserCode,"null","null");			
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {
					sap.m.MessageToast.show("Successfully posted!" );
					if((iRecordCount - 1) === iIndex){
						this.oMdlUploading.getData().Uploading.length = 0;
						this.oMdlUploading.refresh();
					}
					
				},
				context: this

			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Successfully posted! " );
					if((iRecordCount - 1) === iIndex){
						this.oMdlUploading.getData().Uploading.length = 0;
						this.oMdlUploading.refresh();
					}
				}
			});
		}


    });
});
