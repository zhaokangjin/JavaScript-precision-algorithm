// JavaScript Document
"use strict";
var Utils={};
if(!Utils){
	Utils={};
}
Utils.valid=(function(){
	var valid={};
	if(!valid){
		valid={};
	}
	valid.regExp=(function(){
		var regExp={};
		//匹配非负正数
		regExp.regExpNonNegtiveInt=/^[1-9]\d*|0$/;
		//匹配数字
		regExp.number=/^[\-]?([0]|[1-9][0-9]*)([\.][0-9]+)?$/;
		//匹配含小数点的全零表达式，形如 0.00
		regExp.regExpZero=/^[0]+[\.][\d]+$/;
		//匹配不含小数点的全零表达式，形如 0.00
		regExp.regExpAllZero=/^[0]{1,}$/;
		//匹配表示零的数字
		regExp.regExpZero=/^[0]{1,}$|^[0]{1,}[\.][0]{1,}$/;		
		//匹配javascript的指数表达式的数字 例如：-2.1e-15   1.5e+46
		regExp.lge=/^[\-]?[1-9][0-9]*([\.][0-9]*[1-9]+)?[e][\+|\-][1-9]+[0-9]*$/;
		//返回带有各种校验的数字正则对象
		return regExp;
	})();
	valid.arrays=(function(){
		//数组内部全部为数字
		var arrays={};
		arrays.isAllNumber=function(array){
			if(array instanceof Array){
				for(var i=0;i<array.length;i++){
					if(!Utils.valid.regExp.number.test(array[i])){
						return false;
					}
				}
			}else{
				return false;
			}
			//返回带有各种校验的数字正则对象
			return true;			
		}
		arrays.isContain=function(array,obj){
			for(var i=0;i<array.length;i++){
				if(array[i]===obj){
					return true;
				}
			}
			return false;
		}
		return arrays;
	})();	
	return valid;
})();

