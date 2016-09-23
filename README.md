# combobox
美化下拉框, 支持原生select控件渲染和动态数据渲染

## HTML
```html
<select name="S1" id="S1"></select>
<select name="S3" id="S3">
	<option value="">请选择</option>
	<option value="kfc">肯德基</option>
	<option value="madn">麦当劳</option>
	<option value="bsk">必胜客</option>
	<option value="yhdw">永和大王</option>
</select>
```
## Javascript
```javascript
var S1_data = {
  {text:"肯德基",value:"kfc"},
	{text:"麦当劳",value:"madn"},
	{text:"必胜客",value:"bsk"},
	{text:"永和大王",value:"yhdw"},
	{text:"星巴客",value:"starbu"}
}
var defaultConfig = {
  comboboxClass: 'fly-combobox-custom', // 顶层样式名
  openClass: 'fly-combobox-open', // 展开样式名
  selectedClass: 'fly-combobox-selected', // 选中项样式名
  innerText: '请选择', // 默认文本
  innerValue: '', // 默认值
  multiple: false // 是否开启多选，建议在html中使用原生方式设置
}

$('#S1').combobox({data:S1_data});
$('#S3').combobox();
```
