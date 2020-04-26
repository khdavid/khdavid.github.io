function generateWrapper(id)
{
   var result = `
   <div id="`+id+`">
   <div class="article">
     Loading...
   </div>
   </div><br>
   `
   return result;
}

function getPageId()
{
  var url = window.location.toString();
  var urlSplitted = url.split('=');
  if (urlSplitted.length > 1)
  {
    var pageId = parseInt(urlSplitted[1]);
    if (!isNaN(pageId))
    {
     return pageId;
    }
  }
  
  return 1;
}

const cNumArticlesPerPage = 5;

function mod(a, b)
{
  return (a - a % b) / b;
}

function calculateMaxPageId()
{
  var idxMax = links.length - 1;
  return mod(idxMax, cNumArticlesPerPage) + 1
}

function getMinMaxArticleIds(pageId)
{
  var minArticleNumber = (pageId - 1) * cNumArticlesPerPage;
  var maxArticleNumber = pageId * cNumArticlesPerPage - 1;
  maxArticleNumber = Math.min(maxArticleNumber, links.length - 1);
  return [minArticleNumber, maxArticleNumber];
}

function isValidPageId(pageId)
{
  maxPageId = calculateMaxPageId()
  return (pageId >= 1) && (pageId <= maxPageId)
}

function getMinMaxAdjacentPageIds(pageId)
{
  const cMaxNumAdjacents = 10;
  leftElementsCount = mod(cMaxNumAdjacents, 2);
  rightElementsCount = cMaxNumAdjacents - leftElementsCount - 1;

  min = pageId - leftElementsCount;
  max = pageId + rightElementsCount;

  if (min < 1)
  {
    max = max - (min - 1);
    min = 1;
  }

  maxPageId = calculateMaxPageId();

  if (max > maxPageId)
  {
    min = min - (max - maxPageId)
    max = maxPageId;
  }

  min = Math.max(1, min);
  max = Math.min(maxPageId, max);
  return [min, max];
}

function generatePageIdLink(pageId)
{
 return `?page=` + pageId;
}

function generateNavigationLink(pageId, name, caption)
{
  return `
  <div class="`+ name + `">
    <a class="navigation" href="` + generatePageIdLink(pageId) + `">` + 
    caption + `</a> 
  </div>
  `;
}

function generateAdjacentPagesLinks(pageId, min, max)
{
   result = '';
   if (min == max)
   {
     return result
   }
   
   if (min > 1)
   {
     result += `<span class="pageLink">... </span>`;
   }

   for (var i = min; i <= max; i++)
   {
     linkClassName = (i == pageId) ? "pageLinkCurrent" : "pageLink";
     result += `<a class="` + linkClassName + `" href="` + 
     generatePageIdLink(i) + `">` + i + `</a> `
   }

   maxPageId = calculateMaxPageId();
   if (max < maxPageId)
   {
       result += `<span class="pageLink">... </span>`;
   }

   return result;
}

function generateNavigationLinks()
{
  var currentPageId = getPageId();
  var prevPageId = currentPageId - 1;
  var nextPageId = currentPageId + 1;
  [min, max] = getMinMaxAdjacentPageIds(currentPageId)
  result = "";
  if (!isValidPageId(currentPageId))
  {
    return result;
  }

  if (isValidPageId(prevPageId))
  {
    result += generateNavigationLink(prevPageId, "Prev", "Туда");
  }
  result += generateAdjacentPagesLinks(currentPageId, min, max)
  if (isValidPageId(nextPageId))
  {
    result += generateNavigationLink(nextPageId, "Next", "Сюда");
  }
  result += `<br><br>`
  return result;
}


function generateWrappers()
{
  var htmlCode = "";
  var pageId = getPageId();
  
  if (!isValidPageId(pageId))
  {
    return;
  }
  
  [minArticleNumber, maxArticleNumber] = getMinMaxArticleIds(pageId);
  htmlCode += generateNavigationLinks()
  for (var i = minArticleNumber; i <= maxArticleNumber; i++)
  {
    htmlCode += generateWrapper(i);
    if (i < maxArticleNumber)
    {
      htmlCode += `<br><br>`;
    }      
  }
  htmlCode += generateNavigationLinks()
  
  $("#articles").html(htmlCode);
}

function getArticleLinkHTML(link)
{
  return `
  <div class="articleLink">
    <a class="articleLink" href="`+ link +`">открыть</a>
  </div>  
    `
}

function loadArticle(i, link)
{
  var idRef = "#"+i.toString();
  $(idRef).load(link + " div.article", 
  function() 
  {
    articleObject = $(idRef).find("div.article");
    htmlDate = getArticleDateHTML(idRef)
    articleObject.prepend(html);

    htmlLink = getArticleLinkHTML(link);
    articleObject.prepend(htmlLink);
  });
}

function generateArticles()
{
  generateWrappers();
  var pageId = getPageId();
  [minArticleNumber, maxArticleNumber] = getMinMaxArticleIds(pageId);
  
  for (var i = minArticleNumber; i <= maxArticleNumber; i++)
  {
    loadArticle(i, links[i]);
  }

  
}

$( document ).ready(function() 
{ 
  generateArticles();
}
);
