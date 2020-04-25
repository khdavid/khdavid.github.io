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
    linkToLirika = getLink("lirika.html")
    linkToDrama = getLink("drama.html")

    var htmlCode = `
      <div class="menuInternal">
        <div class="header">
          <a class = "header" href="`+ linkToMain + `">О&nbsp;сайте</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToEpos + `">Эпос</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToLirika + `">Лирика</a>
        </div>
        <div class="header">
          <a class = "header" href="`+ linkToDrama + `">Драма</a>
        </div>
     </div>
     <br><br>
    `;

    $(".menu").html(htmlCode);
  }
  


  $( document ).ready(function() 
  {
    populateMenu();
  }
  );
  