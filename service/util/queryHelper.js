/* jshint node: true */
/* jshint esnext: true */
'use strict';

let queryHelper = {};

queryHelper.select = (table, select = '*') => {
  return new Query('SELECT ' + select + ' FROM ' + table);
}

queryHelper.dataTablesQueries = (tableInfo) => {
  const totalQuery = queryHelper
    .select(tableInfo.table, 'COUNT(' + tableInfo.count + ')')
    .where(tableInfo.baseFilter);
  const whereForSearch = tableInfo.filterColumns
    .map((a) => a + ' LIKE ' + tableInfo.searchParamName)
    .reduce((a, b) => a + ' OR ' + b);
  const pagedQuery = queryHelper
    .select(tableInfo.table, tableInfo.select)
    .where(tableInfo.baseFilter)
    .where(whereForSearch)
    .orderBy(tableInfo.ordering)
    .limit(tableInfo.paging);
  return {
    totalQuery: totalQuery,
    filterQuery: totalQuery.where(whereForSearch),
    pagedQuery: pagedQuery,
  }
}

class Query {
  constructor(query, hasWhere = false) {
    this.query = query;
    this.hasWhere = hasWhere;
  }

  orderBy(orderBy) {
    if (orderBy.match(/^([a-zA-Z_][a-zA-Z0-9_]*)( *,? *([a-zA-Z_][a-zA-Z0-9_]*))*$/) == null) {
      throw TypeError('order by contains invalid characters');
    }
    // assert regex for order by just letters and xxx
    return new Query(this.query + ' ORDER BY ' + orderBy, this.hasWhere);
  }

  where(conditions) {
    const keyWord = (this.hasWhere) ? ' AND ' : ' WHERE ';
    return new Query(this.query + keyWord + '(' + conditions + ')', true);
  }

  limit(paging) {
    if (typeof paging.length != 'number' ||
      typeof paging.offset != 'number') {
      throw TypeError('expected number for limiting');
    }
    return new Query(this.query + ' LIMIT ' + paging.length +
      ' OFFSET ' + paging.offset, this.hasWhere);
  }

  build() {
    return this.query;
  }
}

module.exports = queryHelper;
