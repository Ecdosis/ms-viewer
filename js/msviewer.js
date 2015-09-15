/**
 * Object to represent manuscript viewer
 */
function msviewer(target,docid)
{
    this.target = target;
    this.docid = docid;
    var self = this;
    /**
     * Get the actual dimension value from a 123px value
     * @param d the parameter with "px" on the end
     * @return the dimension sans px as a number
     */
    this.dimen = function(d)
    {
        var pos = d.indexOf("px");
        return parseInt(d.substr(0,pos));
    };
    /**
     * Get the index of the next recto page
     * @param start the current page index
     * @return the page index of the next recto (or centre) or the same if no more
     */
    this.nextR = function( start )
    {
        if ( typeof start == "string" )
            start = parseInt(start);
        var i = start+1;
        for ( ;i<this.pages.length;i++ )
        {
            if ( this.pages[i].o=='r' || this.pages[i].o=='c' )
                break;
        }
        return (i>=this.pages.length)?start:i;
    };
    /**
     * Get the previous recto page
     * @param start the index of the current recto page 
     * @return the previous recto or centre aligned index
     */
    this.prevR = function( start )
    {
        var i = (start==0)?0:start-1;
        for ( ;i>0;i-- )
            if ( this.pages[i].o=='r' || this.pages[i].o=='c' )
                break;
        return (i<0)?start:i;
    };
    /**
     * Get the javascript object of the preceding left page
     * @param page the recto or centre aligned page index
     * @return the page object of the corresponding verso or null
     */
    this.leftPage = function( page )
    {
        if ( this.pages[page].o=='c' )
            return null;
        else
        {
            page--;
            if ( page >= 0 )
            {
                if ( this.pages[page].o == 'c' )
                    return null;
                else
                    return this.pages[page];
            }
            else 
                return null;
        }
    };
    /**
     * Set the image height and width
     * @param jImg the jQuery image object
     * @param maxW its maximum width
     * @param maxH its maximum height
     * @param otherH 0 or the i=height of the other img
     */
    this.setImageWidth = function( jImg, maxW, maxH, otherH )
    {
        var h = jImg.height();
        var w = jImg.width();
        var scaledW = Math.round((maxH/h)*w);
        var scaledH = Math.round((maxW/w)*h);
        var realW = scaledW;
        var realH = maxH;
        if ( scaledW > maxW )
        {
            realW = maxW;
            realH = scaledH;
        }
        // force the 2 sides to be the same
        if ( otherH != 0 )
            realH = otherH;
        jImg.height(realH);
        jImg.css("max-width",maxW+"px");
        return realW;
    };
    /**
     * Draw either side or the centre aligned image aleady set
     * @param side the side to redraw
     */
    this.redraw = function( side )
    {
        var vmargin = jQuery("#ms-wrapper").offset().top+jQuery("#ms-slider").height();
        var maxH = Math.max(jQuery(window).height(),window.innerHeight)-vmargin;
        var maxW = jQuery("#ms-main").parent().width();
        maxW = Math.round(maxW/2);
        maxH = Math.round(maxH);
        switch ( side )
        {
            case 'v':
                this.setImageWidth(jQuery("#ms-left img"),maxW,maxH,0);
                break;
            case 'r':
                this.setImageWidth(jQuery("#ms-right img"),maxW,maxH,jQuery("#ms-left img").height());
                break;
            case 'c':
                this.setImageWidth(jQuery("#ms-centre img"),maxW*2,maxH);
                break;
        }
    };
    /**
     * Load an image and wait for it to load fully before you draw it
     * @param jImg the jQuery image object
     * @param side the side to redraw it on ('r', 'v' or 'c')
     */
    this.loadImage = function( jImg, side )
    {
        if ( jImg[0].complete )
        {
            jImg.hide();
            self.redraw(side);
            jImg.fadeIn(250);
        }
        else
        {
            window.setTimeout(self.loadImage,10,jImg,side);
        }
    };
    /**
     * Draw both lhs and rhs page names only
     */
    this.drawPageNames = function(leftPage,rightPage) 
    {
        if ( leftPage != null )
            jQuery("#ms-page-left").text(leftPage.n);
        else
             jQuery("#ms-page-left").text("");
        if ( rightPage != null )
            jQuery("#ms-page-right").text(rightPage.n);
        else
            jQuery("#ms-page-left").text("");
    };
    /**
     * Resize and position the two navigation divs
     */
    this.resizeNavs = function()
    {
        var lNav = jQuery("#ms-left-nav");
        var rNav = jQuery("#ms-right-nav");
        var jImg = jQuery("#ms-right img");
        if ( jImg == undefined || jImg.width()==0 )
            jImg = jQuery("#ms-left img");
        var gap = Math.round(jImg.width()/20);
        lNav.css("left","-"+(gap+Math.round(lNav.width()))+"px");
        rNav.css("right","-"+(gap+Math.round(rNav.width()))+"px");
    };
    /**
     * Draw both lhs and rhs images
     */
    this.drawImgs = function(leftPage,rightPage) 
    {
        if ( leftPage != null )
        {
            if ( jQuery("#ms-left").css("display") == 'none' )
                jQuery("#ms-left").css("display","table-cell");
            jQuery("#ms-left img").attr("src","/corpix/"+this.docid+"/"+leftPage.src);
            this.loadImage( jQuery("#ms-left img"), 'v' );
            jQuery("#ms-page-left").text(leftPage.n);
            if ( rightPage != null )
                jQuery("#ms-centre").css("display","none");
        }
        else
        { 
             jQuery("#ms-left img").removeAttr("src");
             jQuery("#ms-left").css("display",'none' );
             jQuery("#ms-page-left").text("");
        }
        if ( rightPage != null )
        {
            if ( rightPage.o=='c' )
            {
                jQuery("#ms-centre img").attr("src","/corpix/"+this.docid+"/"+rightPage.src);
                this.loadImage( jQuery("#ms-centre img"), 'c' );
                if ( jQuery("#ms-centre").css("display") == 'none' )
                    jQuery("#ms-centre").css("display","table-cell");
                jQuery("#ms-left").css("display","none");
                jQuery("#ms-right").css("display","none");
                jQuery("#ms-page-right").text(rightPage.n);
            }
            else
            {
                if ( jQuery("#ms-right").css("display") == 'none' )
                    jQuery("#ms-right").css("display","table-cell");
                if ( jQuery("#ms-centre").css("display") == 'table-cell' )
                    jQuery("#ms-centre").css("display","none");
                jQuery("#ms-right img").attr("src","/corpix/"+this.docid+"/"+rightPage.src);
                this.loadImage( jQuery("#ms-right img"),'r');
                jQuery("#ms-page-right").text(rightPage.n);
            }
        }
        else
            jQuery("#ms-right img").removeAttr("src");
        self.resizeNavs();
    };
    /**
     * Check that the page index in question is for a recto
     * @param page index into the pages array
     * @return the same index if recto already else the preceding recto
     */
    this.checkRecto = function( page )
    {
        if ( this.pages[page].o == 'r'||this.pages[page].o =='c' )
            return page;
        else 
        {
            var i=page;
            for ( ;i<this.pages.length;i++ )
            {
                if ( this.pages[i].o=='r' || this.pages[i].o=='c' )
                    break;
            }
            if ( i == page || i == this.pages.length )
            {
                i = page;
                for ( ;i>=0;i-- )
                    if ( this.pages[i].o=='r' || this.pages[i].o=='c' )
                        break;
                if ( i==-1||this.pages[i].o == 'v' )
                    return 0;
            }
            return i;
        }
    };
    /* actually create the view here */
    /* these functions are called by the event handlers directly */
    /* div that we hide and make visible contianing the magnified portion */
    this.magnifyDiv = undefined;
    /**
     * Get the image side based on current coordinates
     * @param x the document x-coordinate 
     * @param y the document y coordinate
     */
    this.getSide = function( x, y )
    {
        lImg = jQuery("#ms-left img");
        rImg = jQuery("#ms-right img");
        cImg = jQuery("#ms-centre img");
        var lOff = lImg.offset();
        var rOff = rImg.offset();
        var cOff = cImg.offset();
        if ( x >= lOff.left && x <= lOff.left+lImg.width()
            && y >= lOff.top && y <= lOff.top+lImg.height() )
            return 'r';
        else if ( x >= rOff.left && x <= rOff.left+rImg.width()
            && y >= rOff.top && y <= rOff.top+rImg.height() )
            return 'v';
        else if ( x >= cOff.left && x <= cOff.left+cImg.width()
            && y >= cOff.top && y <= cOff.top+cImg.height() )
            return 'c';
        else 
            return undefined;
    }
    /**
     * Set the background image of the magnify zone
     * @param m the magnify zone div
     * @param side the letter (r,v,c) of the current side
     * @param x the document x-coordinate 
     * @param y the document y coordinate
     */
    this.setBackground = function(m,side,x,y)
    {
        var img;
        switch ( side )
        {
            case 'r':
                img = jQuery("#ms-left img");
                break;
            case 'v':
                img = jQuery("#ms-right img")
                break;
            case 'c':
                img = jQuery("#ms-centre img")
                break;
        }
        var src = img.attr("src");
        var pos = img.offset();
        var iW = img.width();
        var iH = img.height();
        var localX = x - pos.left;
        var localY = y - pos.top;
        var xOff = (localX*100)/iW+11;
        var yOff = (localY*100)/iH+11;
        m.css("background-image",'url("'+src+'")');
        m.css("background-position",xOff+"% "+yOff+"%");
    }
    /**
     * Make the magnify zone visible
     * @param x the global x coordinate of the mouse click
     * @param y the global y coordinate of the mouse click
     * @param side the letter (r,v,c) of the side
     */
    this.makeZone = function( x, y, w, side )
    {
        var src = "";
        var pos;
        var iW, iH;
        var localX,localY;
        var origX = x;
        var origY = y;
        var xOff=0,yOff=0;
        self.magnifyDiv = jQuery("#ms-magnify-zone");
        x -= w/2;
        y -= w/2;
        self.magnifyDiv.width(w);
        self.magnifyDiv.height(w);
        self.magnifyDiv.offset({top:y,left:x});
        self.setBackground(self.magnifyDiv,side,origX,origY);
        self.magnifyDiv.css("visibility","visible");
    }
    /**
     * Copy the generated html into the document and set everything up
     * @param html the html to append to the target
     */
    this.setHtml = function( html )
    {
        var tgt = jQuery("#"+this.target);
        tgt.append(html);
        /**
         * Handle slider events
         */
        var currPage;
        jQuery("#ms-slider").slider(
        {
            min:0,
            max:self.pages.length-1,
            /* called when we slide but don't release */
            slide:function(){
                var value = jQuery("#ms-slider").slider("value");
                currPage = self.checkRecto(value);
                var leftPg = self.leftPage(currPage);
                var rightPg = self.pages[currPage];
                self.drawPageNames(leftPg,rightPg);
                self.resizeNavs();
            },
            /* called when we release the mouse */
            stop: function() {
                var value = jQuery("#ms-slider").slider("value");
                currPage = self.checkRecto(value);
                var leftPg = self.leftPage(currPage);
                var rightPg = self.pages[currPage];
                self.drawImgs(leftPg,rightPg);
            }
        });        
        currPage = (self.pages[0].o=='r')?0:self.nextR(0);
        self.drawImgs(self.leftPage(currPage),self.pages[currPage]);
        jQuery("#go-left").click( function(){
            currPage = self.prevR(currPage);
            jQuery("#ms-slider").slider("value",currPage);
            var leftPg = self.leftPage(currPage);
            var rightPg = self.pages[currPage];
            self.drawImgs(leftPg,rightPg);
        });
        jQuery("#go-right").click(function(){
            currPage = self.nextR(currPage);
            jQuery("#ms-slider").slider("value",currPage);
            var rightPg = self.pages[currPage];
            var leftPg = self.leftPage(currPage);
            self.drawImgs(leftPg,rightPg);
        });
        jQuery("#ms-left").mousedown(function(e){
            self.makeZone(e.pageX,e.pageY,Math.round(jQuery("#ms-left").width()/3),'r');
            return false;
        });
        jQuery("#ms-right").mousedown(function(e){
            self.makeZone(e.pageX,e.pageY,Math.round(jQuery("#ms-right").width()/3),'v');
            return false;
        });
        jQuery("#ms-centre").mousedown(function(e){
            self.makeZone(e.pageX,e.pageY,Math.round(jQuery("#ms-centre").width()/6),'c');
            return false;
        });
        jQuery("#ms-magnify-zone").mousemove(function(e){
            if ( self.magnifyDiv != undefined )
            {
                var w = jQuery("#ms-magnify-zone").width();
                var x = e.pageX-w/2;
                var y = e.pageY-w/2;
                var side = self.getSide(e.pageX,e.pageY);
                if ( side !== undefined )
                {
                    if ( self.magnifyDiv.css("visibility")=="hidden" )
                        self.magnifyDiv.css("visibility","visible");
                    self.magnifyDiv.offset({top:y,left:x});
                    self.setBackground(self.magnifyDiv,side,x,y);
                }
                else
                    self.magnifyDiv.css("visibility","hidden");
            }
        });
        jQuery("#ms-left").mousemove(function(e){
            if ( self.magnifyDiv != undefined )
            {
                var w = jQuery("#ms-magnify-zone").width();
                var x = e.pageX-w/2;
                var y = e.pageY-w/2;
                var side = self.getSide(e.pageX,e.pageY);
                if ( side !== undefined )
                {
                    if ( self.magnifyDiv.css("visibility")=="hidden" )
                        self.magnifyDiv.css("visibility","visible");
                    self.magnifyDiv.offset({top:y,left:x});
                    self.setBackground(magnifyDiv,side,x,y);
                }
                else
                    self.magnifyDiv.css("visibility","hidden");
            }
        });
        jQuery("#ms-right").mousemove(function(e){
            if ( self.magnifyDiv != undefined )
            {
                var w = jQuery("#ms-magnify-zone").width();
                var x = e.pageX-w/2;
                var y = e.pageY-w/2;
                var side = self.getSide(e.pageX,e.pageY);
                if ( side !== undefined )
                {
                    if ( self.magnifyDiv.css("visibility")=="hidden" )
                        self.magnifyDiv.css("visibility","visible");
                    self.magnifyDiv.offset({top:y,left:x});
                    self.setBackground(self.magnifyDiv,side,x,y);
                }
                else
                    self.magnifyDiv.css("visibility","hidden");
            }
        });
        jQuery(document).mouseup(function(){
            if ( self.magnifyDiv !== undefined )
            {
                self.magnifyDiv.css("visibility","hidden");
                self.magnifyDiv = undefined;
            }
        });
    };
    /* Download all the page specifications in JSON format */
    jQuery.get( "http://"+window.location.hostname+"/pages/anthology/?docid="+this.docid,
    function(data)
    {
        self.pages = data;
        var html = '<div id="ms-main">';
        html += '<div id="ms-left-nav">';
        html += '<span id="ms-page-left"></span>';
        html += '<div id="left-sidebar"><i id="go-left" class="fa fa-chevron-left fa-3x"></i></div>';
        html += '</div>'; // end of left nav
        html += '<div id="ms-wrapper">';
        html += '<div id="ms-slider"></div>';
        html += '<div id="ms-left"><img></div>';
        html += '<div id="ms-centre"><img></div>';
        html += '<div id="ms-right"><img></div>';
        html += '</div>';
        html += '<div id="ms-right-nav">';
        html += '<div id="right-sidebar"><i id="go-right" class="fa fa-chevron-right fa-3x"></i></div>';
        html += '<span id="ms-page-right"></span>';
        html += '</div>';
        html += '</div>'; // end main div
        html += '<div id="ms-magnify-zone"></div>'; // magnify zone to hide/show
        self.setHtml(html);
    });
} 
/**
 * This reads the "arguments" to the javascript file
 * @param scrName the name of the script file minus ".js"
 */
function getArgs( scrName )
{
    var scripts = jQuery("script");
    var params = new Object ();
    scripts.each( function(i) {
        var src = jQuery(this).attr("src");
        if ( src != undefined && src.indexOf(scrName) != -1 )
        {
            var qStr = src.replace(/^[^\?]+\??/,'');
            if ( qStr )
            {
                var pairs = qStr.split(/[;&]/);
                for ( var i = 0; i < pairs.length; i++ )
                {
                    var keyVal = pairs[i].split('=');
                    if ( ! keyVal || keyVal.length != 2 )
                        continue;
                    var key = unescape( keyVal[0] );
                    var val = unescape( keyVal[1] );
                    val = val.replace(/\+/g, ' ');
                    params[key] = val;
                }
            }
            return params;
        }
    });
    return params;
}
/* main entry point - gets executed when the page is loaded */
jQuery(function(){
    // DOM Ready - do your stuff 
    var params = getArgs('msviewer');
    var viewer = new msviewer(params['target'],params['docid']);
}); 

