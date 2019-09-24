var deleteLog = false;

$(document).ready(function() {
	$('#pagepiling').pagepiling({
		menu: '#menu',
		anchors: ['page1', 'page2', 'page3'],
		navigation: {
            'textColor': '#f2f2f2',
            'bulletsColor': '#ccc',
            'position': 'right',
            'tooltips': ['Page 1', 'Page 2', 'Page 3', 'Page 4']
        }
	});
});