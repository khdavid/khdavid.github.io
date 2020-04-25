function propogateDate()
{
  html = getArticleDateHTML('')
  $('div.article').prepend(html);
}


$( document ).ready(function() 
{ 
  propogateDate();
}
);
