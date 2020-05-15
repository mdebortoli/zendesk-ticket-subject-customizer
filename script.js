////////////////////////////////////////////////////////////////////////////////
// Ticket Subject/Description Customizer v1.0                                 //
////////////////////////////////////////////////////////////////////////////////
// This script allows you to hide the required subject/description fields in  //
// a Zendesk contact form and replace them with any text and/or custom fields //
////////////////////////////////////////////////////////////////////////////////
// Developed by Marcelo De Bortoli (EMEA Solution Developer)                  //
////////////////////////////////////////////////////////////////////////////////

// Configuration
////////////////////////////////////////////////////////////////////////////////

const ticketFormConfig = [
  {
    // Set your ticket form ID
    formId: 360000685459,

    // Set your desired form subject
    subject: 'New visit request to {{Store}} at {{Preferred time slot}}',

    // Set your desired form subject
    description: 'A new request to visit store {{Store}} tomorrow at {{360009915399}}.'
  },
  // You can set rules for multiple forms by adding new objects to this variable.
  // {
  //   formId: 360000000000,
  //   subject: 'This is the new subject of your second form',
  //   description: 'This is the new description of your second form'
  // }
];

// Do not change anything below this line
////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('new_request') && ticketFormConfig) {
    const formSelector = document.querySelector('.request_ticket_form_id select');
    const currentForm = formSelector.options[formSelector.selectedIndex].value;

    // Check if the current selected form is in the configuration array
    const matchingForm = ticketFormConfig.find(o => o.formId == currentForm);

    if (matchingForm) {
      // Hide subject/description fields
      document.querySelector('.request_subject').style.display = 'none';
      document.querySelector('.request_description').style.display = 'none';

      // Replace subject/description values by the new data before form submission
      document.querySelector('#new_request input[type=submit]').addEventListener('click', function (e) {
        const newSubject = (matchingForm.subject ? getDynamicText(matchingForm.subject) : 'No subject');
        const newDescription = (matchingForm.description ? getDynamicText(matchingForm.description) : 'No description');

        document.getElementById('request_subject').value = newSubject;
        document.getElementById('request_description').value = newDescription;
      });
    }
  }
});

// Return dynamic text from custom field values.
// Usage: Specify your text keeping the required label names between double curly braces.
// Example: getDynamicText('New visit request to {{Store}} store at {{Preferred time slot}}')
// Return example: 'New visit request to London store at 11:30'
function getDynamicText(str) {
  const labels = str.match(/{{([^}]*)}}/g);

  if (labels) {
    for (let i = 0; i < labels.length; i++) {
      const labelName = labels[i].replace(/{{|}}/g, '');

      const fieldId = getFieldIdByLabel(labelName);
      const fieldValue = (!fieldId ? getFieldValueById(`request_custom_fields_${labelName}`) : getFieldValueById(fieldId));

      const returnValue = (fieldValue ? fieldValue : undefined);

      if (returnValue) {
        str = str.replace(labels[i], returnValue);
      }
    }
  }

  return str;
}

// Get custom field value by its input ID
// Usage example: getFieldValueById('request_custom_fields_360009915379')
function getFieldValueById(id) {
  const element = document.getElementById(id);

  if (!element) {
    return undefined;
  }

  const rawValue = element.value;
  const fieldNames = JSON.parse(element.getAttribute('data-tagger'));

  const fieldValue = (fieldNames ? fieldNames.find(o => o.value === rawValue) : rawValue);

  return (fieldValue && fieldValue.label ? fieldValue.label : fieldValue);
}

// Get custom field ID by its label text
// Usage example: getFieldIdByLabel('Store')
// Return example: 'request_custom_fields_360009915379'
function getFieldIdByLabel(label) {
  const labelTags = document.getElementsByTagName('label');
  let field = '';

  for (let i = 0; i < labelTags.length; i++) {
    if (labelTags[i].childNodes[0].textContent == label) {
      field = labelTags[i];
      break;
    }
  }

  return (field.htmlFor ? field.htmlFor : undefined);
}
