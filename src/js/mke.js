/* ===================================================
 * MKEditor.js v1.0.0
 * http://bitbucket.org/dreamteam-etna/mkeditor.git
 * ===================================================
 * Copyright (C) 2015 Christopher Fouquier
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * ========================================================== */

'use strict';

(function(window, $){
    function mke(options) {

        if (!(this instanceof mke)) return new mke(options);

        if (options === undefined) {
            options = {};
        }

        this.settings = extend({
            placeholder: '',
            fullscreen: false,
            language: 'en',
            resize: false,
            fixed: true,
            limit: 0,
            hideBtn: []
        }, options);

        if (this.target === undefined) {
            this.target = document.getElementsByTagName('textarea')[0];
        }

        this.language = {
            "fr": {
                'bold': 'gras',
                'italic': 'italique',
                'code': 'code',
                'header': 'titre',
                'quote': 'Citation',
                'link': 'Lien',
                'picture': 'Image',
                'fullscreen': 'Plein écran',
                'strike': 'Barré',
                'ul': 'Liste à puce',
                'ol': 'Liste numéroté',
                'Words': 'Mots',
                'Characters': 'Caractères',
                'Lines': 'Lignes'
            }
        };

        // { name|title, fontawesome-name (optional), parent (optional), action (optional) }
        this.buttons = [
            { name: 'bold', i: 'fa-bold', action: { 'start': '**', 'end': '**' } },
            { name: 'italic', i: 'fa-italic', action: { 'start': '_', 'end': '_' } },
            { name: 'strike', i: 'fa-strikethrough', action: { 'start': '~~', 'end': '~~' } },
            { name: 'header', i: 'fa-header' },
            { name: 'h1', parent: 'header', action: { 'start': "\n#", 'end': "\n" } },
            { name: 'h2', parent: 'header', action: { 'start': "\n##", 'end': "\n" } },
            { name: 'h3', parent: 'header', action: { 'start': "\n###", 'end': "\n" } },
            { name: 'h4', parent: 'header', action: { 'start': "\n####", 'end': "\n" } },
            { name: 'h5', parent: 'header', action: { 'start': "\n#####", 'end': "\n" } },
            { name: 'h6', parent: 'header', action: { 'start': "\n######", 'end': "\n" } },
            { name: 'quote', i: 'fa-quote-left', action: { 'start': "\n> ", 'end': '' } },
            { name: 'ol', i: 'fa-list-ol', action: { 'start': "\n1. ", 'end': "\n" } },
            { name: 'ul', i: 'fa-list-ul', action: { 'start': "\n* ", 'end': "\n\n" } },
            { name: 'link', i: 'fa-link', action: { 'start': '[', 'end': '](http://)' } },
            { name: 'picture', i: 'fa-picture-o', action: { 'start': '![', 'end': '](http://)' } },
            { name: 'code', i: 'fa-code', action: { 'start': "\n~~~\n", 'end': "\n~~~\n" } },
            { name: 'fullscreen', i: 'fa-arrows-alt' }
        ];

        this.init();
    }

    /**
     * Create DOM
     */
    mke.prototype.loadDom = function() {
        var jqObjString = '<div class="mke"><ul class="mke-toolbar"></ul><textarea class="mke-editor mke-scroll" placeholder="' + this.settings.placeholder + '"></textarea><div class="mke-preview mke-scroll"></div><div class="mke-info"></div></div>'

        this.target.insertAdjacentHTML('beforebegin', jqObjString);
        this.target.style.display = 'none';

        this.mke = document.getElementsByClassName('mke')[0];
        this.mkeEditor = document.getElementsByClassName('mke-editor')[0];
        this.mkeToolbar = document.getElementsByClassName('mke-toolbar')[0];
        this.mkePreview = document.getElementsByClassName('mke-preview')[0];
        this.mkeInfo = document.getElementsByClassName('mke-info')[0];

        if (this.target.value.length) {
            this.mkeEditor.value = this.target.value;
            this.mkePreview.innerHTML = marked(this.target.value);
        }
    };

    /**
     * Create button in toolbar
     * @param (object) btn
     */
    mke.prototype.insertBtn = function(btn) {
        var nameCapitalize = btn.name.charAt(0).toUpperCase() + btn.name.slice(1);

        if (btn.hasOwnProperty('parent')) {
            var p = document.querySelector('button[name=' + btn.parent + ']').parentNode;

            if (document.getElementsByClassName('submenu-' + btn.parent).length === 0) {
                p.innerHTML += '<ul class="submenu submenu-' + btn.parent + '"></ul>';
            }

            document.getElementsByClassName('submenu-' + btn.parent)[0].innerHTML += '<li><button title="' + nameCapitalize + '" name="' + btn.name + '">' + nameCapitalize + '</button></li>';
            p.className = 'menu';
        }
        else {
            this.mkeToolbar.innerHTML += '<li><button title="' + nameCapitalize + '" name="' + btn.name + '"><i class="fa ' + btn.i + '"></i></button></li>';
        }
    };

    /**
     * Remove button in toolbar
     * @param (string) name
     */
    mke.prototype.removeBtn = function(name) {
        var el = document.querySelector('button[name=' + name + ']');
        el.parentNode.removeChild(el);
    };

    /**
     * Action associated with a button
     * @param (object|string) el
     */
    mke.prototype.actionBtn = function(el) {
        if (typeof el === "string") {
            var tag = el;
        }
        else {
            var tag = el.getAttribute('name');
        }

        if (tag === 'fullscreen') {
            if (document.getElementsByClassName('mke-fullscreen-mode')[0] === undefined) {
                this.settings.fullscreen = true;
            }
            else {
                this.settings.fullscreen = false;
            }

            return this.fullscreen();
        }
        else if (typeof el !== 'string' && el.parentNode.classList.contains('menu')) {
            var el = document.getElementsByClassName('submenu-' + el.getAttribute('name'))[0];

            if (!el.classList.contains('open')) {
                el.style.top = this.mkeToolbar.offsetHeight;
                el.className += ' open';
            }
            else {
                el.classList.remove('open');
            }
        }
        else {
            var val = this.mkeEditor.value,
                selected_txt = val.substring(this.mkeEditor.selectionStart, this.mkeEditor.selectionEnd),
                before_txt = val.substring(0, this.mkeEditor.selectionStart),
                after_txt = val.substring(this.mkeEditor.selectionEnd, val.length),
                search = false;

            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].name === tag) {
                    tag = this.buttons[i].action;
                    search = true;
                }
            };

            if (search === true) {
                this.mkeEditor.value = before_txt + tag.start + selected_txt + tag.end + after_txt;
                this.live(this.mkeEditor);
            }
        }
    };

    /**
     * Live preview
     * @param (object) el
     */
    mke.prototype.live = function(el) {
        this.target.value = el.value;
        this.mkePreview.innerHTML = marked(el.value);
        this.info();
    };

    /**
     * Fullscreen editor
     */
    mke.prototype.fullscreen = function() {
        if (this.settings.fullscreen === true) {
            var body = document.getElementsByTagName('body')[0];
            this.mke.className += ' mke-fullscreen-mode';
            body.appendChild(this.mke);
            body.style.overflow = 'hidden';
        }
        else {
            this.mke.classList.remove('mke-fullscreen-mode');
            this.target.parentNode.insertBefore(this.mke, this.target.previousSibling);
            document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }
        this.sizeEditor();
    };

    /**
     * Resize editor, preview and toolbar
     */
    mke.prototype.sizeEditor = function() {
        if (this.settings.fullscreen === false) {
            var margin = this.mkeToolbar.offsetHeight + this.mkeInfo.offsetHeight;

            this.mkeEditor.style.height = this.mke.offsetHeight - margin;
            this.mkePreview.style.height = this.mkeEditor.offsetHeight;
        }
        else {
            this.mkePreview.style.height = 'auto';
            this.mkeEditor.style.height = this.mkePreview.offsetHeight;
        }

        this.mkeToolbar.style.width = '100%';
    };

    /**
     * Count characters, words ands lines of element
     * @param (string) val
     * @return object
     */
    mke.prototype.count = function(val) {
        if (val.length !== 0) {
            return {
                characters : val.length,
                words      : val.match(/\S+/g).length,
                lines      : val.split(/\r*\n/).length
            };
        }
        else {
            return {
                characters : 0,
                words      : 0,
                lines      : 0
            };
        }
    };

    /**
     * Insert infos in bottom bar in editor
     */
    mke.prototype.info = function() {
        this.mkeInfo.innerHTML = '<span class="words"><strong>Words:</strong> ' + this.count(this.target.value).words +'</span><span class="characters"><strong>Characters:</strong> ' + this.count(this.target.value).characters +'</span><span class="lines"><strong>Lines:</strong> ' + this.count(this.target.value).lines +'</span>';
    };

    /**
     * Limit of characters
     */
    mke.prototype.limit = function() {
        if (this.settings.limit !== 0 && typeof this.settings.limit === 'number') {
            this.mkeEditor.setAttribute('maxlength', this.settings.limit);
            this.mkeInfo.innerHTML += '<span class="limit"><strong>Limit:</strong> ' + this.settings.limit + '</span>';
        }
    };

    /**
     * Synchronous scroll
     */
    mke.prototype.scroll = function() {
        var sync = function(e) {
            var divs = document.getElementsByClassName('mke-scroll');

            for (var i = 0; i < divs.length; i++) {
                if (e.target !== divs[i]) {
                    var other = divs[i];
                }
            };

            var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
            other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
            // @TODO: Fix Firefox - Bug IE10
            setTimeout(function() { other.addEventListener('scroll', sync ); }, 10);
        }
        var divs = document.getElementsByClassName('mke-scroll');
        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener('scroll', sync);
        };
    };

    /**
     * Resize
     */
    mke.prototype.resize = function() {
        var that = this
        this.mkeEditor.addEventListener('keydown',function(e){
            if (that.settings.resize === true) {
                if (that.scrollY) {
                    that.style.height += 20;
                }
            }
        });
        if (this.settings.resize === true) {
            this.mke.style.height = 'auto';
            this.mkePreview.style.height = 'auto';
            this.mkeEditor.style.height = 'auto';

            if (this.mkePreview.offsetHeight > this.mkeEditor.offsetHeight) {
                this.mkeEditor.style.height = this.mkePreview.offsetHeight;
            }
            else {
                this.mkePreview.style.height = this.mkeEditor.offsetHeight;
            }
        }
    };

    /**
     * Shortcut
     */
    mke.prototype.macro = function() {
        var that = this;
        this.mkeEditor.addEventListener('keydown', function(e){
            if((e.ctrlKey || e.metaKey) && e.keyCode === 66) {
                e.preventDefault();
                console.log('ctrl|cmd + b');
                that.actionBtn('bold');
            }
            else if ((e.ctrlKey || e.metaKey) && e.keyCode === 73) {
                e.preventDefault();
                console.log('ctrl|cmd + i');
                that.actionBtn('italic');
            }
            else if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                e.preventDefault();
                console.log('ctrl|cmd + s');
                that.actionBtn('strike');
            }
            else if ((e.ctrlKey || e.metaKey) && e.keyCode === 81) {
                e.preventDefault();
                console.log('ctrl|cmd + q');
                that.actionBtn('quote');
            }
            else if (e.which === 9) {
                e.preventDefault();
                console.log('tab'); // tab => \t

                var myValue = "\t";
                var startPos = this.selectionStart;
                var endPos = this.selectionEnd;
                var scrollTop = this.scrollTop;
                this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos,this.value.length);
                this.focus(); // @TODO: Bug IE
                this.selectionStart = startPos + myValue.length;
                this.selectionEnd = startPos + myValue.length;
                this.scrollTop = scrollTop;
                that.live(that.mkeEditor);

                e.preventDefault();
            }
        });
    }

    /**
     * Translate text
     */
    mke.prototype.translate = function() {
        if (this.settings.language !== "en" && typeof this.settings.language === 'string') {
            var obj = this.language[this.settings.language];
            for (var k in obj) {
                var elements = document.querySelectorAll('.mke-toolbar button');
                for (var i = 0; i < elements.length; i++) {
                    if (k === elements[i].getAttribute('name')) {
                        elements[i].setAttribute('title', obj[k].charAt(0).toUpperCase() + obj[k].slice(1));
                    }
                };

                var elements = document.querySelectorAll('.mke-info strong');
                for (var i = 0; i < elements.length; i++) {
                    if (k === elements[i].innerHTML.substring(0, elements[i].innerHTML.length - 1)) {
                        elements[i].innerHTML = obj[k].charAt(0).toUpperCase() + obj[k].slice(1) + ' :';
                    }
                };
            }
        }
    };

    /**
     * Fixed toolbar
     */
    mke.prototype.fixed = function() {
        if (this.settings.fixed === true) {
            var that = this;
            window.addEventListener('scroll', function() {
                var mkeTop = offset(that.mke).top,
                    mkeBot = mkeTop + that.mke.offsetHeight;

                if (this.scrollY > mkeTop && !that.mkeToolbar.classList.contains('mke-toolbar-static')) {
                    that.mkeToolbar.className += ' mke-toolbar-static';
                    that.mkeToolbar.style.width = that.mke.offsetWidth;
                }

                if ((this.scrollY > mkeBot - that.mkeToolbar.offsetHeight || this.scrollY < mkeTop) && that.mkeToolbar.classList.contains('mke-toolbar-static')) {
                    that.mkeToolbar.classList.remove('mke-toolbar-static');
                }
            });
        }
    };

    /**
     * Upload ajax in POST
     */
    mke.prototype.upload = function() {
        if (typeof this.settings.upload === 'string' && this.settings.upload !== '') {

            var request = new XMLHttpRequest();
            request.open("POST", this.settings.upload, true);
            request.onreadystatechange = function () {
                if (request.readyState != 4 || request.status != 200) return;
                console.log(request.responseText);
                // @TODO: Insert ![image](URL_IMAGE) in editor
            };
            request.send('base64/png'); // send image in base64

        }
    };

    /**
     * Initiliaze plugin
     */
    mke.prototype.init = function() {
        var that = this;

        /* Check version Internet Explorer */
        var ieVersion = /*@cc_on (function() {switch(@_jscript_version) {case 1.0: return 3; case 3.0: return 4; case 5.0: return 5; case 5.1: return 5; case 5.5: return 5.5; case 5.6: return 6; case 5.7: return 7; case 5.8: return 8; case 9: return 9; case 10: return 10;}})() || @*/ 0;
        console.log(ieVersion);
        if (ieVersion > 0 && ieVersion < 9) {
            alert('Your web browser version is not supported.');
            return;
        }

        this.loadDom();

        for (var i = 0; i < this.buttons.length; i++) {
            this.insertBtn(this.buttons[i]);
        };

        var buttons = document.querySelectorAll('.mke-toolbar button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(e) {
                that.actionBtn(this);
            });
        };

        for (var i = 0, len = this.settings.hideBtn.length; i < len; i++) {
            this.removeBtn(buttons[i]);
        };

        this.mkeEditor.addEventListener('keyup', function(e) {
            that.live(that.mkeEditor);
        });

        this.info();
        this.limit();
        this.translate();
        this.fixed();
        this.scroll();
        this.macro();
        this.resize();
        this.sizeEditor();

        window.addEventListener('mouseup', function(e) {
            var container = document.getElementsByClassName('submenu')[0];
            if (container !== e.target && document.getElementsByClassName('submenu')[0].classList.contains('open') === true) {
                document.querySelectorAll('.submenu.open')[0].classList.remove('open');
            }
        });

        window.addEventListener('resize', function(e) {
            that.sizeEditor();
        });
    };

    $.fn.MKEditor = function(options) {
        return this.each(function() {
            new mke(options);
        });
    };

    window.MKEditor = mke; //Assign 'mke' to the global variable 'MKEditor'...
})(window, jQuery);