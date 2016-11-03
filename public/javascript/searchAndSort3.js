$(document).ready(function () {
	var table = $('table').DataTable({
		language: {
			"sEmptyTable": "Keine Daten in der Tabelle vorhanden",
			"sInfo": "_START_ bis _END_ von _TOTAL_ Einträgen",
			"sInfoEmpty": "0 bis 0 von 0 Einträgen",
			"sInfoFiltered": "(gefiltert von _MAX_ Einträgen)",
			"sInfoPostFix": "",
			"sInfoThousands": ".",
			"sLengthMenu": "_MENU_ Einträge anzeigen",
			"sLoadingRecords": "Wird geladen...",
			"sProcessing": "Bitte warten...",
			"sSearch": "Suchen",
			"sZeroRecords": "Keine Einträge vorhanden.",
			"oPaginate": {
				"sFirst": "Erste",
				"sPrevious": "Zurück",
				"sNext": "Nächste",
				"sLast": "Letzte"
			},
			"oAria": {
				"sSortAscending": ": aktivieren, um Spalte aufsteigend zu sortieren",
				"sSortDescending": ": aktivieren, um Spalte absteigend zu sortieren"
			},

		},
        ajax: {
			url: '/api/results',
			data: function(d){
				d.category = $('#category').val();
				d.agegroup = $('#agegroup').val();
			}
		},
        columns: [
            { data: 'place' },
            { data: 'start_number' },
			{ data: 'firstname' },
            { data: 'lastname' },
            { data: 'team' },
			{ data: 'timestring', searchable: false, orderable: false },
			{ data: null, searchable: false, orderable: false, render: function(data, type, full) {
				return '<a href=/certificate/' + data.start_number + '>PDF Download</a>';
			}}
        ],
        serverSide: true,
	});

    $('#category').change (function () { table.ajax.reload(); });	
	$('#agegroup').change (function () { table.ajax.reload(); });	
});