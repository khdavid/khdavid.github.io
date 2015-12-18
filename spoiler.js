  $(function() {
    $('.spoiler-body').hide();
    $('.spoiler-head').click(function(){
        $(this).next().slideToggle('normal');
    })

});