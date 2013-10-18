var Ext = Ext || {};

Ext.BACKEND_PREFIX = '';
Ext.ENABLE_VMMAP = true;
Ext.ENABLE_VMMAP_TOOLBAR = true;
Ext.ENABLE_VMMAP_REFRESH = true;
Ext.ENABLE_VMMAP_TAG = false;
Ext.ENABLE_VMMAP_RESIZE = false;
Ext.ENABLE_VMMAP_MIGRATE = true;
Ext.ENABLE_VMLIST_DELETE = false;
Ext.ENABLE_VNC = false;
Ext.ENABLE_ZABBIX = false;
Ext.ENABLE_VMMAP_LEGEND = false;
Ext.ENABLE_LOCAL_FILTER = false;
Ext.ENABLE_CONSOLES = false;

Ext.ENABLE_EDIT_VM = false;

//FATAL, ERROR, WARN, INFO, DEBUG, and TRACE.
Ext.LOG_LEVEL = 'INFO';

Ext.IMG_LOGO_MAIN = "resources/img/onc_logo.png";
Ext.IMG_LOGO_LOGIN = "resources/img/onc_logo_login.png";

Ext.IS_EMBEDDED = false; // can be set to true by params["embedded"]

Ext.ENABLE_TEMPLATE_ACTIVATION = false;

Ext.VM_NAME_MAPPINGS = {
    // associative array of template_name -> display_name and tooltips
    // 'W2008R2_tmpl': ["name", "tooltip"]
};

