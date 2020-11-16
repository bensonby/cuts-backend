/*
Licence: GPL v2 or later
Hosted: https://savannah.gnu.org/

This script extends the Prototype Form.Element api with a method which can set the default
text of a text input and also it can optionally attach a default CSS class to the input field.

Usage:

var my_field = $('input_id');
my_field.defaultText('Search...', 'serach_input_default_class');

The first argument is the default value, the second is the optional class name. To unset the
default value and remove the event handlers it's enough to pass a non-string value to the function:

my_field.defaultText();
my_field.defaultText(false);

(Booth lines removes the event handlers.)
*/

var defaultTextHandlers = {
	blurHandler: function(event) {
		var element = event.element();
		if (/^[\s]*$/.test(element.value)) {
			element.value = element.defaultValue;
			element.addClassName(element.defaultClass);
		}
	},
	focusHandler: function(event) {
		var element = event.element();
		if (element.value == element.defaultValue) {
			element.clear(); 
			element.removeClassName(this.defaultClass);
		}
	}
}

Object.extend(Form.Element.Methods, {
	defaultText: function(element, defValue, classOnDefault) {
		element = $(element);
		var defValueOk = Object.isString(defValue);
		if (defValueOk) {
			element['defaultValue'] = defValue;
			element['defaultClass'] = classOnDefault;
			element.setValue(defValue);
			element.addClassName(classOnDefault);
		}
		if (defValueOk && !element.defaultTextFunction) {
			element.observe('focus', defaultTextHandlers.focusHandler);
			element.observe('blur', defaultTextHandlers.blurHandler);
			element.defaultTextFunction = true;
		} else if (!defValueOk && element.defaultTextFunction) {
			element.stopObserving('focus', defaultTextHandlers.focusHandler);
			element.stopObserving('blur', defaultTextHandlers.blurHandler);
			element.defaultTextFunction = false;
			element.removeClassName(element.defaultClass);
		}
		if (!defValueOk) {
			element.removeClassName(element.defaultClass);
			if (element.getValue() == element.defaultValue) element.clear();
		}
		return element;
	}
});

Element.addMethods();