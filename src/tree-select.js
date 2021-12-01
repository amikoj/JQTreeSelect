; (function (window, $) {
	var TreeSelect = function (ele, opt) {
		this.template = null;
		this.reference = null;
		this.popper = null;
		this.selectParents = null;
		this.selected = null;
		this.selectedNode = null;
		this.opt = opt;
		this.ele = ele;
		this.data = {
			showPop: false,
			source: opt.data || [],
			value: [],
		};
	}

	TreeSelect.prototype = {
		created: function () {
			this.id = $(this.ele).attr('id');
			// console.log('get this ele:', this.ele);
			$(this.ele).empty(); // 先清空
			this.treeSelectEle = $('<div class="tree-select"></div>');
			$(this.ele).append(this.treeSelectEle);
			this.inputGroup = $('<div> </div>');
			this.treeSelectEle.append(this.inputGroup);
			this.searchInput = $(' <input class="tree-node-value yifu-tree-select-search" placeholder="请点击选择或输入搜索" data-toggle="popover"/>');
			this.inputGroup.append(this.searchInput);
			this.lableInput = $('<input class="tree-node-label pick-area" placeholder="请点击选择或输入搜索" readonly />');
			this.inputGroup.append(this.lableInput);

			this.popper = $('<div class="popover-container"></div>');
			this.inputGroup.append(this.popper);
			// 添加状态icon.
			this.treeSelectEle.append(`<span class="yifu-select-arrow" unselectable="on" aria-hidden="true" style="user-select: none;">
            <span role="img" aria-label="down" class="anticon anticon-down ant-select-suffix" >
                <svg viewBox="64 64 896 896" focusable="false" data-icon="down" width="1em" height="1em"
                    fill="currentColor" aria-hidden="true">
                    <path
                        d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z">
                    </path>
                </svg>
            </span>
               <span role="img" aria-label="search" class="anticon anticon-search ant-select-suffix" style="display: none;">
                <svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em"
                    fill="currentColor" aria-hidden="true">
                    <path
                        d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z">
                    </path>
                </svg>
              </span>
            </span>`);

			this.mounted();

			this.hidePopper();

			const name = $(this.ele).attr("name");
			if (name && name.trim()) {
				this.name = name.split('/');
				this.setSelectData(this.name);
			}
			return this;
		},
		mounted: function () {
			let _this = this;
			this.treeSelectEle.find('input[data-toggle="popover"], .tree-node-label').on('click', function (event) {
				const visible = _this.popper.css('display');
				if (visible === 'none') {
					_this.showPopper();
				} else {
					_this.hidePopper();
				}
			})
			this.treeSelectEle.find(' input.yifu-tree-select-search').on('input propertychange', function () {
				_this.doSearch($(this).val());

			});

			$(document).on('click', function (e) {
				if ($(e.target).closest(`#${_this.id}`).length === 0) {
					// 点击元素之外
					_this.hidePopper();
				}
			})

			setTimeout(() => {
				// 延迟加载
				if (_this.data.source && _this.data.source.length && !_this.popper.children().length) {
					_this.setTreeData(_this.data.source);
				}
			}, 800)

		},
		doSearch(value) {
			if (!value || !String(value).trim()) {
				this.popper.children('ul').find('li').css('display', 'block');
				this.popper.children('ul').find('ul').css('display', 'none');
				return
			}
			const filterSpans = this.popper.find(`li span:contains(${value})`);
			console.log('get filterSpans length:', filterSpans.length)
			filterSpans.siblings('ul').find('li').css('display', 'block');
			const parentsUtil = filterSpans.parentsUntil(`#${this.id} .popover-container > ul`)
			parentsUtil.css('display','block');
			parentsUtil.siblings('li').not(`:contains(${value})`).css('display', 'none');

		},
		showPopper() {
			// 展开选中项
			if (this.selected) {
				// 已选中，着色
				this.selectedNode = this.treeSelectEle.find(`span.popover-item[data-code=${this.selected}][data-leaf="true"]`);
				if (this.selectedNode && this.selectedNode.length) {
					this.popper.find('ul li>span.popover-item[data-leaf="true"]').removeClass('active');
					this.selectedNode.parents('ul.tree-select-popper-ul').siblings('span.arrow-left').css('transform', 'rotate(90deg)')
					this.selectedNode.parents('ul.tree-select-popper-ul').show();
					this.selectedNode.addClass('active');
				}
			}
			this.popper.show();
			this.data.showPop = true;
			// 控制显示搜索按钮
			this.treeSelectEle.find('.yifu-select-arrow>span[aria-label="down"]').hide();
			this.treeSelectEle.find('.yifu-select-arrow>span[aria-label="search"]').show();
			this.treeSelectEle.find('.tree-node-label').css('visibility', "hidden");
			this.treeSelectEle.find('input.tree-node-value').css('visibility', "visible");
			this.treeSelectEle.find('input.tree-node-value').trigger("focus"); // 主动获取焦点
		},
		hidePopper() {
			this.popper.hide();
			this.data.showPop = false;
			this.treeSelectEle.find('.yifu-select-arrow>span[aria-label="down"]').show();
			this.treeSelectEle.find('.yifu-select-arrow>span[aria-label="search"]').hide();
			this.treeSelectEle.find('input.tree-node-label').css('visibility', "visible");
			this.treeSelectEle.find('input.tree-node-value').css('visibility', "hidden");
			this.treeSelectEle.find('input.tree-node-value').val('');

			// 需要将Popper中的状态恢复
			this.popper.children('ul').find('li').css('display', 'block');
			this.popper.children('ul').find('ul').css('display', 'none')
		},
		setSelectData(name) {
			// 设置name 
			// console.log('get setSelectData name:', name)
			let _this = this;
			const pro = this.data.source.find(item => item.title === name[0]) || {};
			let city = null;
			let town = null;
			let v = [];

			switch (name.length) {
				case 1:
					// 省
					if (pro && (!pro.children || !pro.children.length) && pro.value) {
						// 无子集的时候，说明设置值有效
						this.selected = pro.value;
					}
					break;

				case 2:
					// 市 
					city = pro.children && pro.children.find(item => item.title === name[1]);
					if (city && (!city.children || !city.children.length) && city.value) {
						// 无子集的时候，说明设置值有效
						this.selected = city.value;
					}
					break;

				case 3:
					// 区
					city = pro.children && pro.children.find(item => item.title === name[1]) || {};
					town = city.children && city.children.find(item => item.title === name[2]);
					if (town && (!town.children || !town.children.length) && town.value) {
						// 无子集的时候，说明设置值有效
						this.selected = town.value;
					}

					break;
				default:
					this.selected = null; // 选中为空
			}
			if (this.selected) {
				this.selectedNode = this.treeSelectEle.find(`span.popover-item[data-code=${this.selected}][data-leaf="true"]`);
				if (this.selectedNode && this.selectedNode.length) {
					this.onChange();
				} else {
					// console.log('get selected ,and need init---------------');
					v.push({ code: pro.value, title: pro.title });
					if (city) {
						v.push({ code: city.value, title: city.title });
					}
					if (town) {
						v.push({ code: town.value, title: town.title });
					}

					this.data.value = v;
					const title = this.data.value.map(item => item.title).join('/');
					this.treeSelectEle.find('input.tree-node-value').attr("placeholder", title);
					const codes = this.data.value.map(item => item.code).join(',');
					this.treeSelectEle.find('input.tree-node-label').attr('data-areacode', codes);
					this.treeSelectEle.find('input.tree-node-label').val(title);
					setTimeout(() => {
						if (this.opt.onChange) {
							this.opt.onChange($(this.ele), this.data.value);  // 选择修改
						}
					}, 200);
					setTimeout(() => {
						// 延迟加载
						if (_this.data.source && _this.data.source.length && !_this.popper.children().length) {
							_this.setTreeData(_this.data.source);
						}

					}, 800)
				}

			}
		},
		onChange() {
			// 选择值改变
			// console.log('onChange:', this.selectedNode);
			if (this.selectedNode && this.selectedNode.length) {
				this.popper.find('ul li>span.popover-item[data-leaf="true"]').removeClass('active');
				this.selectedNode.addClass('active');

				const parents = this.selectedNode.parents('li');
				let v = [];
				parents.each(function () {
					const item = $(this).children('span.popover-item');
					const code = item.data('code');
					const title = item.html();
					// console.log('get selectd:', { code, title })
					v.push({ code, title });
				})

				this.data.value = v.reverse();
				const title = this.data.value.map(item => item.title).join('/');
				this.treeSelectEle.find('input.tree-node-value').attr("placeholder", title);
				const codes = this.data.value.map(item => item.code).join(',');
				this.treeSelectEle.find('.tree-node-label').attr('data-areacode', codes);
				this.treeSelectEle.find('.tree-node-label').val(title);
				setTimeout(() => {
					if (this.opt.onChange) {
						this.opt.onChange($(this.ele), this.data.value);  // 选择修改
					}
				}, 200);
			}

		},
		setTreeData(address) {
			this.data.source = address;
			let _this = this;
			if (this.popper) {
				_this.popper.empty();
				_this._putData(address, this.popper);
				_this.popper.find('ul li>span.arrow-left').on('click', function (event) {
					// 点击
					const ul = $(this).siblings('ul');
					if (!ul.length) {
						// 叶子节点,不做处理
						return
					}
					const visible = ul.css('display');
					if (visible === 'none') {
						// 展开当前级别
						$(this).css('transform', 'rotate(90deg)')
						ul.css('display', 'block');
						ul.parents('li').siblings('li').find('ul').css('display', 'none');
						ul.parents('li').siblings('li').find('ul').prev().prev().css('transform', 'rotate(0deg)')
					} else if (visible === 'block') {
						$(this).css('transform', 'rotate(0deg)')
						ul.css('display', 'none');
					}
					event.stopPropagation()
				})



				_this.popper.find('ul li>span.arrow-left+span.popover-item').on('click', function (event){
					// 折叠可点击的item
					const ul = $(this).siblings('ul');
					if (!ul.length) {
						// 叶子节点,不做处理
						return
					}
					const visible = ul.css('display');
					if (visible === 'none') {
						// 展开当前级别
						$(this).prev().css('transform', 'rotate(90deg)')
						ul.css('display', 'block');
						ul.parents('li').siblings('li').find('ul').css('display', 'none');
					} else if (visible === 'block') {
						$(this).prev().css('transform', 'rotate(0deg)')
						ul.css('display', 'none');
					}
					event.stopPropagation()

				});

				_this.popper.find('ul li>span.popover-item[data-leaf="true"]').on('click', function (event) {
					const code = $(this).data('code');
					if (code !== _this.selected) {
						_this.selected = code;
						_this.selectedNode = $(this);
						_this.onChange();
					}
					// console.log('叶子节点:', _this.selected);
					setTimeout(() => {
						_this.hidePopper();
					}, 100)
					event.stopPropagation();
				});
			}

		},
		_putData(address, parent, hidden = false) {
			const ul = $(`<ul style="display:${hidden ? 'none' : 'block'};" class="tree-select-popper-ul"> </ul>`);
			for (let item of address) {
				const li = $('<li></li>');
				if (item.children && item.children.length) {
					const arrow = $('<span class="arrow-left"> </span>');
					arrow.append('<svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M755.2 544L390.4 874.666667c-17.066667 14.933333-44.8 14.933333-59.733333-2.133334-6.4-8.533333-10.666667-19.2-10.666667-29.866666v-661.333334c0-23.466667 19.2-42.666667 42.666667-42.666666 10.666667 0 21.333333 4.266667 27.733333 10.666666l362.666667 330.666667c17.066667 14.933333 19.2 42.666667 2.133333 59.733333 2.133333 2.133333 0 2.133333 0 4.266667z" ></path></svg>')
					li.append(arrow);
				}
				const row = $(`<span class="popover-item" data-leaf="${!item.children || !item.children.length}"  data-code="${item.value}"></span>`);
				row.html(item.title);
				li.append(row);
				ul.append(li);
				// 添加在后面
				if (item.children && item.children.length) {
					this._putData(item.children, li, true);
				}
			}
			parent.append(ul);
		},
		setValue() {

		}
	}

	$.fn.extend({
		treeSelect: function (opt) {
			return this.each(function () {
				var initProps = {};
				// console.log('get treeSelect:', opt)
				var options = $.extend({}, initProps, opt);
				var plugin = new TreeSelect(this, options);
				return plugin.created();
			})

		}
	})

})(window, jQuery);
