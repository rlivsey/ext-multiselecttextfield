Ext.namespace('Ext.ux');
 
/**
  * Ext.ux.MultiSelectTextField Extension Class
  *
  * @author Richard Livsey
  * @version 0.0.3
  *
  * @class Ext.ux.MultiSelectTextField
  * @extends Ext.form.ComboBox
  * @constructor
  * @param {Object} config Configuration options
  */
Ext.ux.MultiSelectTextField = function(config) {
 
    // init data
    this.values         = [];
    this.displayValues  = [];
    this.hiddenFields   = [];
 
    Ext.ux.MultiSelectTextField.superclass.constructor.call(this, config);
};
 
Ext.extend(Ext.ux.MultiSelectTextField, Ext.form.ComboBox, {
 
  /**
   * @cfg {Boolean} hideTrigger True to hide the trigger element and display only the base text field (defaults to true)
   */
  hideTrigger: true,
  
  // private
  values: [],
  
  // private
  displayValues: [],
  
  // private
  hiddenFields: [],
  
  /**
   * Add a value
   * @param {String} value The value to match
   * @param {Boolean} defer True to not update the field
   */
  addValue: function(v, defer)
  {
    var r = this.findRecord(this.valueField || this.displayField, v);
    if(!r)
    {
      return;
    }
    
    var value = r.data[this.valueField];
    var text  = r.data[this.displayField];
    
    // only if the value hasn't already been added
    if (this.values.indexOf(value) == -1)
    { 
      var hidden = this.el.insertSibling(
                    { tag:'input', 
                      type:'hidden', 
                      value: value,
                      name: (this.hiddenName || this.name)}, 
                    'before', true);
      
      this.values.push(value);
      this.displayValues.push(text);
      this.hiddenFields.push(hidden);
    }
    
    if (!defer)
    {
      this.updateDisplay();
    }
  },
  
  /**
   * Remove a value
   * @param {String} value The value to match
   */
  removeValue: function(v, defer)
  {  
    var r = this.findRecord(this.valueField || this.displayField, v);
    if(!r)
    {
      return;
    }
    
    var value = r.data[this.valueField];
    var text  = r.data[this.displayField];

    var idx = this.values.indexOf(value);
    if (idx == -1)
    {
      return;
    }
    
    this.removeItemAtIndex(idx);
    
    if (!defer)
    {
      this.updateDisplay();
    }
  },

  // private
  removeItemAtIndex: function(idx, defer)
  {
    var field = Ext.get(this.hiddenFields[idx]); 
    field.remove();
    
    this.values[idx]        = null;
    this.displayValues[idx] = null;
    this.hiddenFields[idx]  = null;
    
    if (!defer)
    {
      this.cleanData();
    }
  },

  // private
  cleanData: function()
  {
    this.values         = this.cleanArray(this.values);
    this.displayValues  = this.cleanArray(this.displayValues);
    this.hiddenFields   = this.cleanArray(this.hiddenFields); 
  },
  
  // private  
  cleanArray: function(arr)
  {
    var cleaned = [];
    var len = arr.length;
    for (var i=0; i<len; i++)
    {
      if (arr[i])
      {
        cleaned.push(arr[i]);
      }
    }    
    return cleaned;
  },
  
  /**
   * Sets the specified value(s) into the field. 
   * If the value(s) finds a match, they will be added to the field.
   * @param {Mixed} value The value to match
   */
  setValue: function(v)
  {
    this.clearValue();
    
    if (!(v instanceof Array))
    {
      v = v.split(',');
    }
    
    var len = v.length;
    for (var i=0; i<len; i++)
    {
      this.addValue(v[i], true);
    }
    
    this.updateDisplay();
  },
  
  // private
  onBlur: function()
  {
    this.updateDisplay();
    Ext.form.ComboBox.superclass.onBlur.call(this);
  },
  
  // private
  updateDisplay: function()
  {
    var text = this.displayValues.join(', ');
    if (text.trim() !== '')
    {
      text += ', ';
    }
      
    Ext.form.ComboBox.superclass.setValue.call(this, text);    
  },
  
  /**
   * Clears any value(s) currently set in the field
   */
  clearValue : function()
  {
    this.values = [];
    this.displayValues = [];
    
    var len = this.hiddenFields.length;
    for (var i=0; i<len; i++)
    {
      this.hiddenFields[i].remove();
    }
    this.hiddenFields = [];
    
    //
    this.setRawValue('');
    this.lastSelectionText = '';
    this.applyEmptyText();
  },
  
  // private
  onSelect : function(record, index)
  {
    if(this.fireEvent('beforeselect', this, record, index) !== false){
      this.addValue(record.data[this.valueField || this.displayField]);
      this.collapse();
      this.fireEvent('select', this, record, index);
    }
  },
    
  // private
  onRender : function(ct, position)
  {
    Ext.form.ComboBox.superclass.onRender.call(this, ct, position);
        
    // prevent input submission
    this.el.dom.removeAttribute('name');
    
    if(Ext.isGecko)
    {
      this.el.dom.setAttribute('autocomplete', 'off');
    }

    if(!this.lazyInit)
    {
      this.initList();
    }
    else
    {
      this.on('focus', this.initList, this, {single: true});
    }

    if(!this.editable)
    {
      this.editable = true;
      this.setEditable(false);
    }
  },
  
  // private
  getLastValue: function()
  {
    var parts = this.getRawValue().split(',');
    return parts[parts.length - 1].trim();
  },
  
  // private
  // Implements the default empty TriggerField.onTriggerClick function
  onTriggerClick : function()
  {
    if(this.disabled)
    {
      return;
    }
    
    if(this.isExpanded())
    {
      this.collapse();
      this.el.focus();
    }
    else
    {
      this.onFocus({});
      if(this.triggerAction == 'all') 
      {
        this.doQuery(this.allQuery, true);
      } 
      else
      {
        this.doQuery(this.getLastValue());
      }
      this.el.focus();
    }
  },
  
  //private
  initQuery : function()
  {
    var val = this.getLastValue();
    if (val.trim() !== '')
    {
      this.doQuery(val);
    }
    this.removeOld();
  },
  
  // private
  // clean out the data from ones you've deleted
  removeOld: function()
  {
    var str   = this.getRawValue();  
    var len   = this.displayValues.length;
    // sorted by length descending
    var items = this.displayValues.slice().sort(function(x,y){ return y.length - x.length; });
    var removed = false;
    
    for (var i=0; i<len; i++)
    {
      var val = items[i];
      if (str.indexOf(val) == -1)
      {
        removed = true;
        this.removeItemAtIndex(this.displayValues.indexOf(val), true);
      }
    }

    if (removed)
    {
      this.cleanData();
      this.updateDisplay();
    }
  },
  
  // private
  fieldParts: function()
  {
    var parts = this.getRawValue().split(',');
    var len = parts.length;
    for (var i=0; i<len; i++)
    {
      parts[i] = parts[i].trim();
    }
    return parts;
  },
  
  //private
  onLoad : function()
  {
    if(!this.hasFocus)
    {
      return;
    }
    
    if(this.store.getCount() > 0)
    {
      this.expand();
      this.restrictHeight();
      
      if(this.lastQuery == this.allQuery)
      {  
        /*
          if(this.editable)
          {
            this.el.dom.select();
          }
        */
        if(!this.selectByValue(this.value, true))
        {
          this.select(0, true);
        }
      }
      else
      {
        this.selectNext();
        if(this.typeAhead && this.lastKey != Ext.EventObject.BACKSPACE && this.lastKey != Ext.EventObject.DELETE)
        {
          this.taTask.delay(this.typeAheadDelay);
        }
      }
    }
    else
    {
      this.onEmptyResults();
    }
    //this.el.focus();
  },
  
  validateValue:function(value)
  {  
    if (this.values.length === 0 && !this.allowBlank)
    {
      this.markInvalid(this.blankText);
      return false;
    }
    
    if (this.values.length < this.minLength)
    {
      this.markInvalid(String.format(this.minLengthText, this.minLength));
      return false;
    }
    
    if (this.values.length > this.maxLength)
    {
      this.markInvalid(String.format(this.maxLengthText, this.maxLength));
      return false;
    }
    
    return true;
  }
  
});

Ext.reg('multitextfield', Ext.ux.MultiSelectTextField);