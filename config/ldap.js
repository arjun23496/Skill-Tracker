// config/database.js

module.exports = {

    options : {
    			url : 'ldap://localhost',						 //host url of the ldap server
    			// socketPath	: '', 								 //Socket path if using AF_UNIX sockets
    			// log	: '', 									     //Bunyan logger instance (Default: built-in instance)
    			// timeout	: '', 									 //Milliseconds client should let operations live for before timing out (Default: Infinity)
    			// connectTimeout : '', 							 //Milliseconds client should wait before timing out on TCP connections (Default: OS default)
    			// tlsOptions	: '',								 //Additional options passed to TLS connection layer when connecting via ldaps:// (See: The TLS docs for node.js)
    			// idleTimeout	: '',								 //Milliseconds after last activity before client emits idle event
    			// strictDN	: '' 								 //Force strict DN parsing for client methods (Default is true)
    		},

  	baseDN : 'ou=bluepages,dc=test,dc=com',  //distinguished name of tree to search for users
    usernameAttribute : 'mail',  //name of the username field

};