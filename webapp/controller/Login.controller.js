sap.ui.define([
  "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/apptech/app-bankinteg/controller/AppUI5"
], function(Controller, JSONModel ,MessageToast,AppUI5) {
  "use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.Login", {
		onInit: function () {
		//get all databse
		//this.oMdlDatabase = new JSONModel("model/databases.json");
		this.oMdlDatabase = new JSONModel();
		this.getAllRecords("getAllDB");
		this.myModel = new sap.ui.model.json.JSONModel();
		
		},
		 action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		},
		onLogin: function (oEvent) {
		//	sap.ui.core.UIComponent.getRouterFor(this).navTo("Dashboard");
			var sUserName = this.getView().byId("Username");
			var sPassword = this.getView().byId("Password");
			var sDBCompany = this.getView().byId("selectDatabase");//"DEVBFI_FSQR";
			var oLoginCredentials = {};
			oLoginCredentials.CompanyDB = sDBCompany.getSelectedItem().getKey();
			oLoginCredentials.UserName = sUserName.getValue();//"manager";
			oLoginCredentials.Password = sPassword.getValue();//"1234";
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/Login",
				data: JSON.stringify(oLoginCredentials),
				type: "POST",
				// xhrFields: {
				// 	withCredentials: true
				// },
				error: function (xhr, status, error) {
					// var Message = xhr.responseJSON["error"].message.value;
					// sap.m.MessageToast.show(Message);
					console.log(xhr);
				},
				context:this,
				success: function (json) {}
			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Session ID: " + results.SessionId); 
					jQuery.sap.storage.Storage.put("dataBase",sDBCompany.getSelectedItem().getKey());
					jQuery.sap.storage.Storage.put("userCode",sUserName.getValue());
					jQuery.sap.storage.Storage.put("isLogin",true);
					sap.ui.core.UIComponent.getRouterFor(this).navTo("Dashboard");
				}
			});
			// //create udt
			// //Payement Processing Draft  Header
			// this.createTable("APP_OPPD", "Payment Processing - Header", "bott_NoObject");
			// //Payement Processing Details
			// this.createTable("APP_PPD1", "Payment Processing - Details", "bott_NoObject");
			// //Saved Draft OutGoing Payment
			// this.createTable("APP_ODOP", "Payment File Extraction", "bott_NoObject");
			// //create udf
			// //Payement Processing Header
			//  this.createField("App_DocNum", "Document Number", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_DateFrom", "Date From", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_DateTo", "Date To", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_Suppliercode", "Supplier Code", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_SupplierName", "Supplier Name", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_TaggingDate", "Tagging Date", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_Status", "Status", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_Remarks", "Remarks", "@APP_OPPD", "db_Alpha", "", 250);
			// this.createField("App_CreatedBy", "Created By", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_CreatedDate", "Created Date", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_UpdatedBy", "Updated By", "@APP_OPPD", "db_Alpha", "", 30);
			// this.createField("App_UpdatedDate", "Updated Date", "@APP_OPPD", "db_Alpha", "", 30);
			// //Payement Processing Details
			// this.createField("App_DocNum", "Document Number", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_Priority", "Priority", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_InvDocNum", "Invoice DocNum", "@APP_PPD1", "db_Alpha", "", 25);
			// this.createField("App_InvoiceDocType", "Invoice DocType Type", "@APP_PPD1", "db_Alpha", "", 25);
			// this.createField("App_InvoiceNo", "Invoice Number", "@APP_PPD1", "db_Alpha", "", 20);
			// this.createField("App_InvoiceDate", "Invoice Date", "@APP_PPD1", "db_Alpha", "", 30);
			//  this.createField("App_CheckDate", "Check Date", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_SuppRefNo", "Supplier Reference No", "@APP_PPD1", "db_Alpha", "", 25);
			// this.createField("App_Remarks", "Remarks", "@APP_PPD1", "db_Alpha", "", 250);
			// this.createField("App_InvoiceType", "Invoice Type", "@APP_PPD1", "db_Alpha", "", 10);
			// this.createField("App_Desc", "Description", "@APP_PPD1", "db_Alpha", "", 250);
			// this.createField("App_InvoiceCur", "Invoice Currency", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_InvoiceTotal", "InvoiceTotal", "@APP_PPD1", "db_Float", "st_Sum", 30);
			// this.createField("App_RemainingBal", "RemainingBal ", "@APP_PPD1", "db_Float", "st_Sum", 30);
			// this.createField("App_PaymentAmount", "PaymentAmount ", "@APP_PPD1", "db_Float", "st_Sum", 30);
			// this.createField("App_CRANo", "CRA Number", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_LineNumber", "PaymentAmount ", "@APP_PPD1", "db_Numeric", "", 30);
			// this.createField("App_CreatedBy", "Created By", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_CreatedDate", "Created Date", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_UpdatedBy", "Updated By", "@APP_PPD1", "db_Alpha", "", 30);
			// this.createField("App_UpdatedDate", "Updated Date", "@APP_PPD1", "db_Alpha", "", 30);
			// // Saved Draft OutGoing Payment
			// this.createField("App_DocEntry", "Document Entry", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_DocNum", "Batch Number", "@APP_ODOP", "db_Alpha", "", 300);
			// this.createField("App_PNBPrntBrnch", "PNB Printing Branch", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_DistPatchTo", "Dispatch To", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_DispatchCode", "Dispatch Code", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_DispatchName", "Dispatch Name", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_PNBAccountNo", "PNB Account No", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_PNBAccountName", "PNB Account Name", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_Remarks", "Remarks", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_CreatedBy", "Created By", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_CreatedDate", "Created Date", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_UpdatedBy", "Updated By", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_UpdatedDate", "Updated Date", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_Status", "Status", "@APP_ODOP", "db_Alpha", "", 30);
			//tagging if Outgoing payment is created from this integ
			// this.createField("App_isFromBankInteg", "Status", "OPDF", "db_Alpha", "", 30);
			// //Payement Processing Details
			// this.createField("App_DocNum", "Batch Number", "@APP_ODOP", "db_Alpha", "", 30);
			// this.createField("App_DocEntry", "Document Entry", "@APP_DOP1", "db_Alpha", "", 30);
			//this.createField("App_InvDocNum", "Inv. Document Number", "@APP_DOP1", "db_Alpha", "", 30);
			// this.createField("App_CreatedBy", "Created By", "@APP_DOP1", "db_Alpha", "", 30);
			// this.createField("App_CreatedDate", "Created Date", "@APP_DOP1", "db_Alpha", "", 30);
			// this.createField("App_UpdatedBy", "Updated By", "@APP_DOP1", "db_Alpha", "", 30);
			// this.createField("App_UpdatedDate", "Updated Date", "@APP_DOP1", "db_Alpha", "", 30);
			// //Add App_BatchNum in A/R invoice once tagged batch
			// this.createField("App_BatchNum", "Batch Number", "OPCH", "db_Alpha", "", 30);
			// //Add App_BatchNum in A/P Downpayment once tagged batch
			// this.createField("App_BatchNum", "Batch Number", "ODPO", "db_Alpha", "", 30);
			
		},
		createTable: function (sTableName, sDescription, sTableType) {
			var tableInfo = {};
			tableInfo.TableName = sTableName;
			tableInfo.TableDescription = sDescription;
			tableInfo.TableType = sTableType;

			var stringTableInfo = JSON.stringify(tableInfo);
			$.ajax({
				url: "https://18.136.35.41:5000/b1s/v1/UserTablesMD",
				data: stringTableInfo,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {
					return 0;
				},
				context: this
			});

		},

		/*
		Generic function helper to create field.
		@@ params : Field Name
					Field Description
					Table Name - ex. "@APP_OAMS"
					Field Type - ("db_Alpha", "db_Date","db_Float","db_Memo","db_Numeric")
					Field SubType - ("st_Percentage", "st_Price", "st_Quantity", "st_Rate", "st_Sum", "st_Image")
					Character Size 
		*/
		createField: function (sFieldName, sDescription, sTableName, sType, sSubType, iSize) {
			var oFieldInfo = {};
			if (sFieldName === undefined || sDescription === undefined || sTableName === undefined) {
				return -1;
			}

			oFieldInfo.Description = sDescription;
			oFieldInfo.Name = sFieldName;
			oFieldInfo.TableName = sTableName;
			oFieldInfo.Type = sType;

			if (iSize === undefined || sType === "db_Numeric") {
				iSize = 11;
			}

			oFieldInfo.EditSize = iSize;
			oFieldInfo.Size = iSize;

			if (sType === "db_Float" || (!sSubType === undefined)) {
				oFieldInfo.SubType = sSubType;
			}

			var dataString = JSON.stringify(oFieldInfo);

			$.ajax({
				url: "https://18.136.35.41:5000/b1s/v1/UserFieldsMD",
				data: dataString,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {

					return 0;
				},
				context: this
			});

			return -1;

		},
		//GET ALL Database
		getAllRecords: function(queryTag){
			// var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBankIntegration&QUERYTAG="+ queryTag +
				"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlDatabase.setJSON("{\"Database\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlDatabase, "oMdlDatabase");
				}
			});
		}
		
	});
});