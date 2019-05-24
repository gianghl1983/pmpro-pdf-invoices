jQuery(function(){
    pmpropdf_js.batch_process = {
        total_count : 0,
        total_created : 0,
        total_skipped : 0
    };

    jQuery('.pmpropdf_tab').on('click', function(){
        jQuery('.pmpropdf_tab').removeClass('active');
        jQuery(this).addClass('active');

        var tab_i = jQuery(this).attr('data-tab');

        jQuery('.pmpropdf_option_section').removeClass('visible');
        jQuery('.pmpropdf_option_section[data-tab=' + tab_i + ']').addClass('visible');;
    });

    jQuery('.generate_missing_logs').on('click', function(e){
        e.preventDefault();
        jQuery('.missing_invoice_log').html('<div class="item">Generating Missing Invoices...</div>');
        pmpropdf_ajax_batch_loop(100, 0);
    });

    jQuery('.pmpropdf_logo_upload').on('click', function(e){
        e.preventDefault();
        pmpropdf_logo_uploader();
    });

    jQuery('.pmpropdf_logo_remove').on('click', function(e){
        e.preventDefault();
        jQuery('.logo_holder').html('');
        jQuery('#logo_url').val('');
    });
});

function pmpropdf_ajax_batch_loop(batch_size, batch_no){
    jQuery.ajax({
        url : pmpropdf_js.ajax_url,
        type : 'post',
        data : {
            action : 'pmpropdf_batch_processor',
            batch_size : batch_size,
            batch_no : batch_no
        },
        success : function( response ) {
            response = JSON.parse(response);

            pmpropdf_js.batch_process.total_count += typeof response.batch_count !== 'undefined' ? response.batch_count : 0;
            pmpropdf_js.batch_process.total_created += typeof response.created !== 'undefined' ? response.created : 0;
            pmpropdf_js.batch_process.total_skipped += typeof response.skipped !== 'undefined' ? response.skipped : 0;

            pmpropdf_update_batch_stats();

            if(typeof response.batch_no !== 'undefined' && typeof response.batch_count !== 'undefined'){
                if(response.batch_count >= batch_size){
                    //Iterate another loop
                    jQuery('.missing_invoice_log').append('<div class="item">Processing...</div>');
                    pmpropdf_ajax_batch_loop(batch_size, response.batch_no+1);
                } else {
                    //Show complete message
                    jQuery('.missing_invoice_log').append('<div class="item">Processing Complete!</div>');
                }
            }

        }
    });
}

function pmpropdf_update_batch_stats(){
    jQuery('.missing_invoice_log').html(
        '<div class="item">' +
            'Processed: ' + pmpropdf_js.batch_process.total_count +
            ' - Created: ' + pmpropdf_js.batch_process.total_created +
            ' - Skipped: ' + pmpropdf_js.batch_process.total_skipped +
        '</div>'
    );
}

function pmpropdf_logo_uploader(){
    var file_frame, image_data;
    if(undefined !== file_frame) {
        file_frame.open();
        return;
    }

    file_frame = wp.media.frames.file_frame = wp.media({
        title: 'Select Logo for use in Invoice',
        button: {
           text: 'Set Logo'
        },
        multiple: false,
    });


    file_frame.on( 'select', function() {
      var attachment = file_frame.state().get('selection').first().toJSON();

      jQuery('.logo_holder').html('<img src="'+attachment.url+'" alt="" style="max-width:150px;"/>');
      jQuery('#logo_url').val(attachment.url);
    });

    // Now display the actual file_frame
    file_frame.open();
}