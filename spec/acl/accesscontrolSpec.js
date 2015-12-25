/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
'use strict';

const accesscontrol = require('../../acl/accesscontrol');

describe('access control', () => {
  it('should give access to admin page to admin', () => {
    accesscontrol.hasPermissionTo('admin', 'view admin page', function(err, result){
      expect(result).toBe(true);
    });
  });

  it('should not give access to admin page to guests', () => {
    accesscontrol.hasPermissionTo('guest', 'view admin page', function(err, result){
      expect(result).toBe(false);
    });
  });

  it('should give access to payment validation page to admin', () => {
    accesscontrol.hasPermissionTo('admin', 'confirm payments', function(err, result){
      expect(result).toBe(true);
    });
  });

  it('should not give access to payment validation page to guests', () => {
    accesscontrol.hasPermissionTo('guest', 'confirm payments', function(err, result){
      expect(result).toBe(false);
    });
  });

  it('should give access to participant details to admin only', () => {
    accesscontrol.hasPermissionTo('guest', 'view participant details', function(err, result){
      expect(result).toBe(false);
    });
    accesscontrol.hasPermissionTo('admin', 'view participant details', function(err, result){
      expect(result).toBe(true);
    });
  });
});