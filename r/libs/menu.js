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
  


  $( document ).ready(function() 
  {
    populateMenu();
  }
  );
  