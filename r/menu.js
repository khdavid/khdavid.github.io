  function getLink(path)
  {
    var menuTag = $("#menu").attr('tag');
    var link = `../` + path;
    if (menuTag == "main")
    {
      link = `/` + path;
    }
    return link
  }

  function populateMenu()
  {
    linkToMain = getLink("")
    linkToAbout = getLink("about.html")
    linkToKnitting = "https://goo.gl/photos/ZNStASHPyEdkYbuK6"

    var htmlCode = `
      <div class="menu">
        <div class="header">
          <a class = "header" href="`+ linkToMain + `">Все&nbsp;рецепты</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToAbout + `">О&nbsp;сайте</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToKnitting + `">Вязание</a>
        </div>
       
      </div>
    `;

    $("#menu").html(htmlCode);
  }
  
 

  
  function getTDCellCode(imageNumber)
  {
    return `<td class="mainTable"><img class="mainTable" src="image`+ imageNumber.toString() +`.jpg"></td>`;

  }
  function populateTables(idKey)
  {
    var idMin = parseInt($(idKey).attr('idMin'));
    var idMax = parseInt($(idKey).attr('idMax'));
    var htmlCode = `<table class="mainTable">`;

    for (id = idMin; id <= idMax; id+=2)
    {

      htmlCode +=`<tr>`;
      htmlCode += getTDCellCode(id);

      if (id < idMax)
      {
        htmlCode += getTDCellCode(id + 1);
      }
      else
      {
        htmlCode += `<td></td>`;
      }

      htmlCode += `</tr>`;
    }
    htmlCode += `</table>`;
    $(idKey).html(htmlCode);

  }
  
  function populateAllTables()
  {
    populateTables("#mainTableId");
    populateTables("#mainTableId1");
    populateTables("#mainTableId2");
    populateTables("#mainTableId3");
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
    populateAllTables();
  }
  );
  
  $( window ).resize(function() 
  {
    populateCSSSettings();
  }
  );
