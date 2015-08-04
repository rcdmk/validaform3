
# Validaform 3

This is a project for client-side javascript validation of form data
based on data attributes using jQuery 1.6+ to interface the DOM.

The intent of this project is to provide a easy to use validation
kit that webdesigners can use without any programming knowledge.
A non obstrusive way to validate your forms without mixing markup
and scripts.


## How to use:

- Insert the script in the page:  
	`<script src="js/rcdmk-validaform3.js"></script>`
	
- Add the attribute "data-validaform" to the form tag:  
	`<form data-validaform="true">`
	
- Add the attributes to the fields  
	`<input data-vf-req="true" data-vf-text="o e-mail" ...`
	
**Note:** Don't forget to include the jQuery library 1.5+

  

## Validation rules:

>**Notice:**  
>_Althrough this text is in english (or pretend to), all the date, time and number formatting is referenced as the ISO standards used in_ _Brazil__, other latin and some european countries:_
>
>**dates:** `dd/mm/yyyy` (25/12/2000)  
>**decimal separator:** `,` (_coma:_ 1,99)  
>**thousands separator:** `.` (_dot:_ 1.234.567)  
>**negative numbers:** `-` (_dash:_ -123 or -1.234,56)
>
>_There are plans to make extentions to change this formats in the future to make this script localizable or globalizable._


###`data-vf-text`:

The text used for the validation message

**Accepts:**

_A string containing the article and name of the field to be used in the validation message._

**Examples:**

    data-vf-text="o e-mail"
    data-vf-text="a senha"

---
###`data-vf-req`:

Marks a field as required (non empty).

> **Note:** All fields that are not marked with this flag are considered valid if empty (non selected in case of selects, radios and checkboxes).
	
**Accepts:**

_Any non empty value will enable this flag.  
For checkboxes and multiple selects this can accept an integer representing the minimum number of options to be selected._

**Examples:**

    data-vf-req="true"
    data-vf-req="2"

---
###`data-vf-size`:

Specify the exact size of the the field value.  
A field with this attribute must have exactly the length specified

**Accepts:**  

_An integer greater then zero._

**Exemples:**

    data-vf-size="2"
    data-vf-size="14"

---
###`data-vf-type`:

Specify the data type of the field, validating by its format.  
Used by other validations like range to specify the type of range (except `CPF` and `CNPJ`).  
Some of these also impose a formating when typing like `money`. Other just restrict the input like `int`.

**Accepts:**

_`date`: Date format_  
Validate the format of a date string like `22/03/2005`.  
This uses first a format check and then a parse check to validate the date, even for leap years.

_`decimal`, `float` or `money`: Number with decimal places format_    
Validate the format of formatted string numbers like `1.025,15`, `1025,15` or `1025`.  
The `money` format also applyies a format mask and input restriction to the input field propper for currency values.


_`int` or `integer`: Integer number format_  
Validate the format of integer string numbers like `1005`, `1.005` or `-1005`.

_`email`: e-mail format_  
Validate the format of the eletronic address with a complex _regular expression_  

_`cpf`: CPF format_  
Validate the format of the CPF number validating the checking digits  

_`cnpj`: CNPJ format_  
Validate the format of the CNPJ number validating the checking digits  

>**Note:** I know that many of you can realise that this can't guaranty that the e-mail is really valid, but it's always good to advice that this script only validates the format and don't check if the e-mail really exists.

**Examples:**

    data-vf-type="money"
    data-vf-type="int"
    data-vf-type="date"

---
###`data-vf-range`

Specify the type of range validation to apply.

**Accepts:**

_The data types: `date` and all numeric data types._


**Examples:**

    data-vf-range="date"
    data-vf-range="int"

---
###`data-vf-range-min`

Specify a minimum value for the input.  
Relly on the `data-vf-range` attribute (if this is ommited, uses the `data-vf-type`) to apply the validation.


**Accepts:**

_A valid minimum value for the specified data type._


**Examples:**

    data-vf-range-min="1" data-vf-range="int"
    data-vf-range-min="01/01/1930" data-vf-type="date"


---
###`data-vf-range-max`

Specify a maximum value for the input.  
Relly on the `data-vf-range` attribute (if this is ommited, uses the `data-vf-type`) to apply the validation.


**Accepts:**

_A valid maximum value for the specified data type._


**Examples:**

    data-vf-range-max="100" data-vf-range="int"
    data-vf-range-max="31/12/2029" data-vf-type="date"

---
###`data-vf-compare`:

Specify a field to compare the value with.

**Accepts:**

_A valid ID of other input in the page to compare the value with. Alerting for non matching values like on password retype fields._

**Examples:**

    data-vf-compare="IdOfAnotherField"
    data-vf-compare="verifyPassword"

---
###`data-vf-mask-key`:

Specify a key character to be used as the placeholder characters of the mask formatting.

**Accepts:**

_Any non empty single character._

**Default:** `#`


###`data-vf-mask`:

Specify an input mask for the content like a date or telephone number.

**Accepts:**

_Any character sequence, representing the input mask with key/placehoder characters to be replaced by the entered text._

**Examples:**

    data-vf-mask="##/##/####" (input: "25122005", output: "25/12/2005")
    data-vf-mask="pn# @@@@@" data-vf-mask-key="@" (input: "a1B2C", output: "pn# a1B2C")

---
###`data-vf-allow`:

Specify a regular expression to validate the entered text, restricting the input.  

**Accepts:**

_A JavaScript regular expression string._

**Examples:**

    data-vf-allow="[0-9]"
    data-vf-allow="[a-zA-Z0-9]"
    data-vf-allow="[A-Z]"



## Plus

**TEXTAREA `maxlength` support**  

By implementing this validation on a form, you instantly gain support for `maxlength` on `textarea` elements inside that form. You just have to include the `maxlength="someNumber"` and it will work.

>**Note:** This will not be valid HTML 4 or XHTML.  
>HTML5 already have support for maxlength on textareas, so it's valid.


**`String.prototype.trim()`**  

Support form the missing `trim()` function on strings (removes blank spaces from the beggining and end of a string).  
Just call `someStringVar.trim()`.


**`String.prototype.reverse()`**  

Support for the missing `reverse()` function on strings (reverses the string).  
Just call `someStringVar.reverse()`.


**Dinamyc binding or delagetion for dinamically created fields**

If you create a field dinamically (using simple DOM manipulations or AJAX) with the validation attributes, they will just work without calling any more code.  
