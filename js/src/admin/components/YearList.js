import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import $ from 'jquery';
import Modal from 'flarum/common/components/Modal';

export default class YearList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    
    this.modelId = this.attrs.modelId;
    this.years = [];
    this.loading = true;
    this.newYearRange = '';
    
    // Add editing state variables
    this.editingYearId = null;
    this.editYearRange = '';
    
    this.loadYears();
  }

  // 当接收到新的modelId时触发
  onupdate(vnode) {
    if (this.modelId !== this.attrs.modelId) {
      this.modelId = this.attrs.modelId;
      this.years = [];
      this.loading = true;
      this.loadYears();
    }
  }
  
  loadYears(forceRefresh = false) {
    if (!this.modelId) {
      this.years = [];
      this.loading = false;
      m.redraw();
      return;
    }
    
    this.loading = true;
    
    // Create request URL and parameters
    const url = app.forum.attribute('apiUrl') + '/canbus/years';
    const params = {
      'filter[model_id]': this.modelId
    };
    
    // Add timestamp parameter to avoid cache
    if (forceRefresh) {
      params._nocache = new Date().getTime();
    }
    
    app.request({
      method: 'GET',
      url: url,
      params: params,
      // Add request headers to disable cache
      headers: forceRefresh ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      } : {}
    }).then(result => {
      this.years = result.data || [];
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.years = [];
      this.loading = false;
      m.redraw();
    });
  }
  
  view() {
    if (!this.modelId) {
      return <div className="YearList">
        <p>Please select a model first.</p>
      </div>;
    }
    
    return (
      <div className="YearList">
        <h3>Year Ranges</h3>
        
        <div className="CanBusForm">
          <div className="form-group">
            <label>Add New Year Range</label>
            <input 
              type="text" 
              className="FormControl" 
              value={this.newYearRange} 
              oninput={e => this.newYearRange = e.target.value} 
              placeholder="e.g. 2010-2015" 
            />
          </div>
          
          <Button
            className="Button Button--primary"
            disabled={this.loading}
            onclick={() => this.saveYear()}
          >
            Add Year Range
          </Button>
        </div>
        
        {this.loading ? (
          <LoadingIndicator />
        ) : (
          <table className="CanBusTable">
            <thead>
              <tr>
                <th>{app.translator.trans('ltydi-canbus-settings.admin.years.year_range')}</th>
                <th className="actions">{app.translator.trans('ltydi-canbus-settings.admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.years.map(year => (
                <tr key={year.id}>
                  <td>{year.attributes.year_range}</td>
                  <td className="actions">
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-edit',
                      onclick: () => this.editYear(year),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.edit_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-trash',
                      onclick: () => this.deleteYear(year),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.delete_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-arrow-right',
                      onclick: () => this.attrs.onSelect(year),
                      title: app.translator.trans('ltydi-canbus-settings.admin.years.view_configs_title')
                    })}
                  </td>
                </tr>
              ))}
              
              {this.years.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center">
                    {app.translator.trans('ltydi-canbus-settings.admin.years.no_years')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  saveYear() {
    if (!this.newYearRange || !this.newYearRange.trim()) return;
    
    this.loading = true;
    
    const requestData = {
      data: {
        type: 'canbus-years',
        attributes: {
          year_range: this.newYearRange.trim()
        },
        relationships: {
          model: {
            data: {
              type: 'canbus-models',
              id: this.modelId
            }
          }
        }
      }
    };
    
    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/canbus/years',
      body: requestData
    }).then(result => {
      this.years.push(result.data);
      this.newYearRange = '';
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.loading = false;
      m.redraw();
      alert('Error adding year: ' + (error.response?.errors?.[0]?.detail || error));
    });
  }
  
  deleteYear(year) {
    app.modal.show(DeleteYearModal, {
      year: year,
      onconfirm: () => {
        this.loading = true;
        
        app.request({
          method: 'DELETE',
          url: app.forum.attribute('apiUrl') + '/canbus/years/' + year.id
        }).then(() => {
          this.years = this.years.filter(y => y.id !== year.id);
          this.loading = false;
          m.redraw();
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error deleting year: ' + error);
        });
      }
    });
  }
  
  editYear(year) {
    app.modal.show(EditYearModal, {
      year: year,
      onsubmit: (newYearRange) => {
        if (!newYearRange || newYearRange === year.attributes.year_range) return;
        
        this.loading = true;
        
        const requestData = {
          data: {
            type: 'canbus-years',
            id: year.id,
            attributes: {
              year_range: newYearRange.trim()
            }
          }
        };
        
        // Ensure year.id is valid
        if (!year.id) {
          alert('Error: Year ID cannot be empty');
          this.loading = false;
          m.redraw();
          return;
        }
        
        app.request({
          method: 'PATCH',
          url: app.forum.attribute('apiUrl') + '/canbus/years/' + year.id,
          body: requestData
        }).then(result => {
          // Update local data
          const index = this.years.findIndex(y => y.id === year.id);
          if (index !== -1) {
            this.years[index] = result.data;
          }
          
          this.loading = false;
          m.redraw();
          
          // Force refresh year list
          this.loadYears(true);
          
          app.alerts.show({type: 'success'}, `Year range updated successfully to: ${newYearRange.trim()}`);
        }).catch(error => {
          this.loading = false;
          m.redraw();
          
          alert('Error updating year: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
}

// Edit Year Modal
class EditYearModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.year = this.attrs.year;
    this.newYearRange = this.year.attributes.year_range || '';
  }
  
  className() {
    return 'EditYearModal Modal--small';
  }
  
  title() {
    return 'Edit Year Range';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label>Year Range</label>
            <input 
              className="FormControl" 
              type="text" 
              value={this.newYearRange} 
              oninput={e => this.newYearRange = e.target.value} 
              placeholder="e.g. 2010-2015"
            />
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              onclick={() => {
                this.attrs.onsubmit(this.newYearRange);
                this.hide();
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Delete Year Modal
class DeleteYearModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.year = this.attrs.year;
  }
  
  className() {
    return 'DeleteYearModal Modal--small';
  }
  
  title() {
    return 'Confirm Deletion';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <p>Are you sure you want to delete the year range "{this.year.attributes.year_range}"? This will also delete all associated configs and links.</p>
        
        <div className="Form-group">
          <Button
            className="Button Button--primary Button--danger"
            onclick={() => {
              this.attrs.onconfirm();
              this.hide();
            }}
          >
            Delete
          </Button>
          {' '}
          <Button
            className="Button"
            onclick={() => this.hide()}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}

