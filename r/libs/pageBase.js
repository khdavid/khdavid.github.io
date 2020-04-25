function getArticleDate(idRef)
{
  if (idRef=='')
  {
    date = $('div.article').attr('date');
    return date;
  }
  else
  {
    articleObject = $(idRef).find("div.article");
    date = articleObject.attr('date');
    return date;
  }  
}

function getArticleDateHTML(idRef)
{
  date = getArticleDate(idRef);
  html = `<div class="date"><b>` + date + `</b></div><br>`;
  return html;
}

function populateCSSSettings()
{
  maxWidth = 800;
  stretchingCoeff = 0.9;

  var width = $(window).width();
  
  if (width > maxWidth)
  {
    var textWidth = maxWidth * stretchingCoeff;
    var padding = (width - textWidth) / 2
    $(".mainText").css('width', textWidth);
    $(".mainText").css('padding-left', padding);
    }
  else
  {
    stretchingCoeffPercent = (stretchingCoeff * 100).toString()+ '%';
    paddingPercent = ((1 - stretchingCoeff) / 2 * 100).toString()+ '%';
    $(".mainText").css('width', stretchingCoeffPercent);
    $(".mainText").css('padding-left', paddingPercent);
  }
}    


$( document ).ready(function() 
{ 
  populateCSSSettings();
}
);

$( window ).resize(function() 
{
  populateCSSSettings();
});

