(function(window) {

    var TPLS = {

        cHtml: '<div class="fly-combobox {{comboboxClass}}"></div>',

        innerHtml: '<div class="fly-combobox-inner">' +
            '<div class="fly-combobox-text" data-value="{{innerValue}}">{{innerText}}</div>' +
            '<i class="fly-combobox-toggle"></i>' +
            '</div>',

        itemsHtml: '<div class="fly-combobox-items"><ul></ul></div>',

        optionHtml: '<li data-value="{{optionValue}}">{{optionText}}</li>'

    }

    var _zIndex = 1;

    function TplToStr(tpl, data) {
        return tpl.replace(/{{(.*?)}}/g, function($1, $2) {
            return data[$2];
        });
    }



    var Select = function(select, opts) {
        this.select = select;
        this.$select = $(select);
        this.options = opts;
        this.datas = this.options.data || [];
        this.selectedValue = [];
        this.multiple = $(select).attr("multiple") || opts.multiple;
        this.init();
    }

    Select.prototype = {

        init: function() {
            if (!this.select.multiple && this.multiple)
                this.select.multiple = true;
            this.select.style.display = "none";
            this.build();
            this.bindEvent();
        },
        build: function() {

            // 模版转成对象
            this.combobox = $(TplToStr(TPLS.cHtml, {
                comboboxClass: this.options.comboboxClass
            })); // 最外层
            this.combobox.css('zIndex', _zIndex++);
            this.inner = $(TplToStr(TPLS.innerHtml, {
                innerValue: this.options.innerValue,
                innerText: this.options.innerText
            })); // inner层
            this.itemsContainer = $(TPLS.itemsHtml); // 列表容器层
            this.items = this._buildItems();

            this.itemsContainer.children().append(this.items);
            this.combobox.append(this.inner);
            this.combobox.append(this.itemsContainer);

            this.combobox.insertAfter(this.select);

        },
        bindEvent: function() {

            var self = this;

            this.$select.on("change", function(e) {
                self.selectOption(e);
            });

            this.itemsContainer.on("click", "li", function(e) {
                self.selectItem(e, this);
            });

            this.inner.on("click", function(e) {

                e.stopPropagation();
                self.combobox.css('zIndex', _zIndex++);

                if (self.inner.hasClass(self.options.openClass)) {
                    self._hideContainer();
                } else {
                    self._showContainer();
                }

            });

            var formParent;
            if (formParent = this.hasFormParent()) {
                $(formParent).on('reset', function() {
                    self.reset();
                })
            }

            $(document).on("click", function(e) {
                self._hideContainer();
            })
        },

        selectOption: function() {
            var isMult = this.multiple;
            var options = this.select.options;
            var v = this.$select.val();
            if (!v) {
                this._clearSelectedValue();
            }

            this._getSelectedOptions();

            this.syncToItem();

        },

        selectItem: function(e, trigger) {

            var isMult = this.multiple;
            var selectedClass = this.options.selectedClass,
                //required = this.options.required,
                innerValue = this.options.innerValue;
            var _item = $(trigger);
            if ($.trim(_item.attr("data-value")) == innerValue) { // 非必选时选中默认
                this.itemsContainer.find("li").removeClass(selectedClass);
            } else {
                if (isMult) {
                    e.stopPropagation();
                    _item.toggleClass(selectedClass);
                } else {
                    this._hideContainer();
                    this.itemsContainer.find("li").removeClass(selectedClass);
                    _item.addClass(selectedClass)
                }
            }

            this._getSelectedItem();

            this.syncToOption();

        },

        syncToItem: function() {
            this._checkItem();
            this.syncToInner();
        },

        syncToOption: function() {
            this._checkOption();
            this.syncToInner();
        },
        syncToInner: function() {
            if (!this.selectedValue.length) {
                this._clearSelectedValue();
            }
            var selectedValue = this.selectedValue,
                _innerText = [],
                _innerValue = [];
            for (var i = 0, len = selectedValue.length; i < len; i++) {
                _innerText.push(selectedValue[i]["text"]);
                _innerValue.push(selectedValue[i]["value"]);
            }
            this.inner.children(".fly-combobox-text").text(_innerText.join(","));
            this.inner.children(".fly-combobox-text").attr("data-value", _innerValue.join(","));
        },
        setValue: function(val) {
            var isMult = this.multiple,
                d;
            if (Object.prototype.toString.call(val).slice(8, -1) == "String")
                val = [val];

            this.selectedValue = [];
            for (var i = 0, len = val.length; i < len; i++) {
                this.selectedValue.push({
                    value: val[i]
                });
            }

            this._checkOption();
            this.$select.trigger("change");

        },
        reset: function() {
            this.selectedValue = [];
            this.syncToItem();
        },
        _checkItem: function() {
            var selectedValue = this.selectedValue,
                items = this.items,
                selectedClass = this.options.selectedClass;
            for (var i = 0, len = items.length; i < len; i++) {
                var _item = $(items[i]);
                _item.removeClass(selectedClass);
                for (var iSe = 0, iLen = selectedValue.length; iSe < iLen; iSe++) {
                    if (_item.attr("data-value") == selectedValue[iSe]["value"])
                        _item.addClass(selectedClass);
                }
            }

        },
        _checkOption: function() {
            var options = this.select.options,
                selectedValue = this.selectedValue,
                iLen = selectedValue.length;

            for (var i = 0, len = options.length; i < len; i++) {
                options[i].selected = false;

                for (var iSe = 0; iSe < iLen; iSe++) {
                    if (options[i]["value"] == selectedValue[iSe]["value"]) {
                        options[i].selected = true;
                    }
                }
            }

            if (!iLen) {
                this.select.selectedIndex = 0;
            }
        },
        _clearSelectedValue: function() {
            this.selectedValue = [{
                text: this.options.innerText,
                value: this.options.innerValue
            }];
        },
        _getSelectedOptions: function() {
            var options = this.select.options;
            this.selectedValue = [];
            for (var i = 0, len = options.length; i < len; i++) {
                if (options[i].selected)
                    this.selectedValue.push({
                        text: options[i]["text"],
                        value: options[i]["value"]
                    });
            }
        },
        _getSelectedItem: function() {
            var _items = this.items;
            var selectedClass = this.options.selectedClass;
            this.selectedValue = [];
            for (var i = 0, len = _items.length; i < len; i++) {
                var _item = $(_items[i]);
                if (_item.hasClass(selectedClass)) {
                    var _text = _item.text(),
                        _value = _item.attr("data-value");

                    this.selectedValue.push({
                        text: _text,
                        value: _value
                    })
                }
            }

        },

        _showContainer: function() {
            this.inner.addClass(this.options.openClass);
            this.itemsContainer.show();
        },
        _hideContainer: function() {
            this.inner.removeClass(this.options.openClass);
            this.itemsContainer.hide();
        },
        _getSelectData: function() {
            var select = this.select,
                options = select.options,
                _data = [];
            for (var i = 0, len = options.length; i < len; i++) {
                _data.push({
                    text: options[i]["text"],
                    value: options[i]["value"]
                })
            }
            return _data;
        },

        _buildItems: function() {
            // select数据
            var sData,
                iStrs = "";
            if (this.datas.length) {
                sData = this.datas;
                this._buildOptions();
                iStrs = TplToStr(TPLS.optionHtml, {
                    optionText: this.options.innerText,
                    optionValue: this.options.innerValue
                });
            } else {
                sData = this.datas = this._getSelectData();
            }

            for (var i = 0, len = sData.length; i < len; i++) {
                iStrs += TplToStr(TPLS.optionHtml, {
                    optionText: sData[i]["text"],
                    optionValue: sData[i]["value"]
                })
            }
            return $(iStrs);

        },
        _buildOptions: function() {
            var _datas = this.datas,
                select = this.select,
                multiple = this.multiple,
                ops = this.options;

            if (!this.multiple)
                select.options.add(new Option(ops.innerText, ops.innerValue));

            for (var i = 0, len = _datas.length; i < len; i++) {
                select.options.add(new Option(_datas[i]["text"], _datas[i]["value"]))
            }
        },
        hasFormParent: function() {
            var formParent,
                select = this.select,
                P = select.parentNode;
            while (P && P != document.body) {
                if (P.tagName.toLowerCase() == "form") {
                    formParent = P;
                    break;
                }
                P = P.parentNode;
            }
            return formParent;
        }
    }

    // 默认参数
    var DEFAULTCONFIG = {
        comboboxClass: 'fly-combobox-custom',
        openClass: 'fly-combobox-open',
        selectedClass: 'fly-combobox-selected',
        innerText: '请选择',
        innerValue: '',
        multiple: false
    }

    $.fn.combobox = function(opts) {
        opts = $.extend({}, DEFAULTCONFIG, opts);
        return this.each(function() {
            if (!$(this).data('fly.combobox')) {
                $(this).data('fly.combobox', new Select(this, opts));
            }
        });
    }



})(window);