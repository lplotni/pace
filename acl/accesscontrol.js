var rbac2 = require('rbac2');

var rules = [
    {a: 'admin', can: 'view admin page'},
    {a: 'admin', can: 'confirm payments'}
];

var rbac = new rbac2(rules);

var hasPermissionTo = function(userRole, action) {
    var accessControlCheckResult = false;
    rbac.check(userRole, action, function(err, result){
        accessControlCheckResult = result;
    });
    return accessControlCheckResult;
};

module.exports = {
    hasPermissionTo: hasPermissionTo
};