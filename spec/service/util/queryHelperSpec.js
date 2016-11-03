/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, spyOn, it, expect, fail, jasmine */
'use strict';

const queryHelper = require('../../../service/util/queryHelper');

describe('queryHelper', () => {
    it('should generate a select all query', () => {
        const q = queryHelper.select('PARTICIPANTS').build();
        expect(q).toEqual('SELECT * FROM PARTICIPANTS');
    });

    it('should generate a select query with specific columns', () => {
        const q = queryHelper.select('PARTICIPANTS', 'ID, TEAM').build();
        expect(q).toEqual('SELECT ID, TEAM FROM PARTICIPANTS');
    });

    it('should add an order by to the query', () => {
        const q = queryHelper
            .select('PARTICIPANTS', 'ID, TEAM')
            .orderBy('FIRSTNAME, LASTNAME')
            .build();
        expect(q).toEqual('SELECT ID, TEAM FROM PARTICIPANTS ORDER BY FIRSTNAME, LASTNAME');
    });

    it('should add a where clause to the query', () => {
        const q = queryHelper
            .select('T')
            .where('X = Y')
            .build();
        expect(q).toEqual('SELECT * FROM T WHERE (X = Y)');
    });

    it('should limit a query by specified bounds', () => {
        const q = queryHelper
            .select('T')
            .limit({
                offset: 10,
                length: 15
            })
            .build();
        expect(q).toEqual('SELECT * FROM T LIMIT 15 OFFSET 10');
    });

    it('should be able to create two different queries from one parent', () => {
        const parent = queryHelper.select("T");
        const q1 = parent.orderBy('A').build();
        const q2 = parent.orderBy('B').build();

        expect(q1).toEqual('SELECT * FROM T ORDER BY A');
        expect(q2).toEqual('SELECT * FROM T ORDER BY B');
    });

    it('should combine where conditions with an AND', () => {
        const q = queryHelper
            .select('T')
            .where('A = B')
            .where('C = D')
            .build();
        expect(q).toEqual('SELECT * FROM T WHERE (A = B) AND (C = D)');
    });

    it('should fail with sql injection order by', () => {
        const q = function () {
            queryHelper
                .select('T')
                .orderBy('; DELETE T;--')
                .build();
        };
        expect(q).toThrowError(TypeError);
    });

    it('should fail with sql injection limit', () => {
        const q = function () {
            queryHelper
                .select('T')
                .limit('; DELETE T', 10);
        };

        expect(q).toThrowError(TypeError);
    });

    it('should be able generate DataTables queries', () => {
        const q = queryHelper.dataTablesQueries({
            count: 'ID',
            table: 'A',
            baseFilter: 'X = Y AND B != C',
            filterColumns: ['FIRSTNAME', 'LASTNAME', 'TEAM'],
            searchParamName: '$1',
            paging: {
                offset: 5,
                length: 10
            },
            select: 'X, Y, Z',
            ordering: 'FIRSTNAME ASC',
        });
        const totalQ = q.totalQuery.build();
        const filterQ = q.filterQuery.build();
        const pagedQ = q.pagedQuery.build();

        expect(totalQ).toEqual('SELECT COUNT(ID) FROM A WHERE (X = Y AND B != C)');
        expect(filterQ).toEqual('SELECT COUNT(ID) FROM A WHERE (X = Y AND B != C)' +
            ' AND (FIRSTNAME LIKE $1 OR LASTNAME LIKE $1 OR TEAM LIKE $1)');
        expect(pagedQ).toEqual('SELECT X, Y, Z FROM A WHERE (X = Y AND B != C)' +
            ' AND (FIRSTNAME LIKE $1 OR LASTNAME LIKE $1 OR TEAM LIKE $1)' +
            ' ORDER BY FIRSTNAME ASC' +
            ' LIMIT 10 OFFSET 5');
    });

});