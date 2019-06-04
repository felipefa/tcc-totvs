$(document).ready(function () {
	// $(':text').css('text-transform', 'uppercase');
	$(':text').on('blur', function () {
		input = $(this);
		if (input.val() == '' || input.val() == null) {
			input.parent().addClass('has-error');
		} else {
			// input.val(input.val().toUpperCase());
			input.parent().removeClass('has-error');
		}
	});
});
