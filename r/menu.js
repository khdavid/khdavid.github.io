  function getLink(path)
  {
    var menuTag = $(".menu").attr('tag');
    var link = `../` + path;
    if (menuTag == "main")
    {
      link = path;
    }
    return link
  }

  function populateMenu()
  {
    linkToMain = getLink("index.html")
    linkToEpos = getLink("epos.html")

    var htmlCode = `
      <div class="menuInternal">
        <div class="header">
          <a class = "header" href="`+ linkToMain + `">О&nbsp;сайте</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToEpos + `">Эпос</a>
        </div>
     </div>
    `;

    $(".menu").html(htmlCode);
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

  function populateTitleName(document)
  {
    stringTitle=$("h1").text();
    stringTitle += $("div.mainText h2").text();
    document.title = stringTitle;
  }

  $( document ).ready(function() 
  {
    populateTitleName(document);
    populateMenu();
    populateCSSSettings();
  }
  );
  
  $( window ).resize(function() 
  {
    populateCSSSettings();
  }
  );
