/* jshint node: true */
/* jshint esnext: true */
'use strict';

var rbac2 = require('rbac2');

var rules = [
    {a: 'admin', can: 'view admin page'},
    {a: 'admin', can: 'confirm payments'},
    {a: 'admin', can: 'delete'},
    {a: 'admin', can: 'view participant details'}
];

var rbac = new rbac2(rules);

var hasPermissionTo = function(userRole, action) {
    let accessControlCheckResult = false;
    rbac.check(userRole, action, (err, result) => {
        accessControlCheckResult = result;
    });
    return accessControlCheckResult;
};

module.exports = {
    hasPermissionTo: hasPermissionTo
};
