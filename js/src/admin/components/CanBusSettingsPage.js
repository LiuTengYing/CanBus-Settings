import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import BrandList from './BrandList';
import ModelList from './ModelList';
import YearList from './YearList';
import ConfigList from './ConfigList';
import LinkList from './LinkList';
import EditBrandModal from './EditBrandModal';
import DeleteBrandModal from './DeleteBrandModal';

export default class CanBusSettingsPage extends ExtensionPage {
  refreshSettings() {
    return app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/settings',
      body: {
        data: [{
          type: 'settings',
          id: 'ltydi-canbus-settings.promptText'
        }, {
          type: 'settings',
          id: 'ltydi-canbus-settings.displayName'
        }]
      }
    })
    .then(response => {
      if (response && response.data) {
        response.data.forEach(setting => {
          if (setting.id === 'ltydi-canbus-settings.promptText') {
            if (!app.data.settings) {
              app.data.settings = {};
            }
            app.data.settings['ltydi-canbus-settings.promptText'] = setting.attributes.value;
            
            if (app.forum && app.forum.data && app.forum.data.attributes) {
              app.forum.data.attributes['canbus.promptText'] = setting.attributes.value;
            }
          }
          if (setting.id === 'ltydi-canbus-settings.displayName') {
            if (!app.data.settings) {
              app.data.settings = {};
            }
            app.data.settings['ltydi-canbus-settings.displayName'] = setting.attributes.value;
            
            if (app.forum && app.forum.data && app.forum.data.attributes) {
              app.forum.data.attributes['canbus.displayName'] = setting.attributes.value;
            }
          }
        });
      }
      return response;
    })
    .catch(error => {
      try {
        const localValue = localStorage.getItem('canbus-settings-promptText');
        if (localValue) {
          if (!app.data.settings) app.data.settings = {};
          app.data.settings['ltydi-canbus-settings.promptText'] = localValue;
        }
        const localDisplayName = localStorage.getItem('canbus-settings-displayName');
        if (localDisplayName) {
          if (!app.data.settings) app.data.settings = {};
          app.data.settings['ltydi-canbus-settings.displayName'] = localDisplayName;
        }
      } catch (e) {}
      return { data: [] };
    });
  }
  
  oninit(vnode) {
    super.oninit(vnode);
    
    this.loading = true;
    this.section = 'brands';
    this.hierarchy = [];
    this.promptText = '';
    this.displayName = 'CanBus Settings';
    
    try {
      const localStorageValue = localStorage.getItem('canbus-settings-promptText');
      if (localStorageValue) {
        this.promptText = localStorageValue;
      }
      const localDisplayName = localStorage.getItem('canbus-settings-displayName');
      if (localDisplayName) {
        this.displayName = localDisplayName;
      }
    } catch (e) {}
    
    this.refreshSettings().then(() => {
      if (app.forum && app.forum.attribute('canbus.promptText')) {
        this.promptText = app.forum.attribute('canbus.promptText');
      }
      else if (app.data && app.data.settings && app.data.settings['ltydi-canbus-settings.promptText']) {
        this.promptText = app.data.settings['ltydi-canbus-settings.promptText'];
      }
      
      if (app.forum && app.forum.attribute('canbus.displayName')) {
        this.displayName = app.forum.attribute('canbus.displayName');
      }
      else if (app.data && app.data.settings && app.data.settings['ltydi-canbus-settings.displayName']) {
        this.displayName = app.data.settings['ltydi-canbus-settings.displayName'];
      }
    });
    
    this.loadBrands();
  }

  loadBrands() {
    this.loading = true;
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/brands'
    }).then(result => {
      this.brands = result.data || [];
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.brands = [];
      this.loading = false;
      m.redraw();
    });
  }

  content() {
    return (
      <div className="ExtensionPage-settings CanBusSettingsPage" style={{ 
        maxWidth: 'none',
        margin: '0',
        width: '100%'
      }}>
        <div className="container" style={{ 
          maxWidth: 'none',
          padding: '0 20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div className="Form-group" style={{ width: '100%' }}>
            <label>Display Name</label>
            <div className="helpText">
              Customize the display name for CanBus Settings that appears in navigation and page titles.
            </div>
            <input 
              id="canbus-displayName-input"
              className="FormControl" 
              type="text" 
              value={this.displayName}
              oninput={(e) => this.displayName = e.target.value}
              placeholder="CanBus Settings"
              style={{ 
                width: '100%',
                maxWidth: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p className="helpText" style={{ marginTop: '5px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
              This name will be displayed in the forum navigation and page titles.
            </p>
          </div>
          
          <div className="Form-group" style={{ width: '100%' }}>
            <label>CanBus Message</label>
            <div className="helpText">
              Customize the CanBus message that appears at the top of the settings page.
            </div>
            <input 
              id="canbus-promptText-input"
              className="FormControl" 
              type="text" 
              value={this.promptText}
              oninput={(e) => this.promptText = e.target.value}
              placeholder="Welcome to the CanBus configuration page. Please select your vehicle details to find the appropriate settings."
              style={{ 
                width: '100%',
                maxWidth: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p className="helpText" style={{ marginTop: '5px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
              This CanBus message helps guide users through the configuration process.
            </p>
            <div className="Form-group Form--controls">
              {Button.component({
                type: 'submit',
                className: 'Button Button--primary',
                loading: this.loading,
                onclick: this.saveSettings.bind(this)
              }, 'Save Changes')}
            </div>
          </div>

          <div className="FormSectionGroup" style={{ width: '100%' }}>
            <div className="FormSection">
              <label>Vehicle Database</label>
              <p className="helpText">Organize and manage vehicle information and configurations</p>
              
              <div className="CanBusInstructions" style={{ width: '100%' }}>
                <div className="CanBusInstructions-header">
                  <i className="fas fa-info-circle"></i> Database Management Guide
                </div>
                <div className="CanBusInstructions-content">
                  <p>Follow these steps to manage vehicle configurations:</p>
                  <ol>
                    <li><strong>Brands:</strong> Add vehicle manufacturers</li>
                    <li><strong>Models:</strong> Add vehicle models using the <i className="fas fa-arrow-right"></i> icon</li>
                    <li><strong>Years:</strong> Specify model years using the <i className="fas fa-arrow-right"></i> icon</li>
                    <li><strong>Configurations:</strong> Add specific configurations using the <i className="fas fa-arrow-right"></i> icon</li>
                    <li><strong>Settings:</strong> Add configuration details using the <i className="fas fa-arrow-right"></i> icon</li>
                    <li><strong>Resources:</strong> Add related documentation and resources</li>
                  </ol>
                  <p>This hierarchical structure helps users easily locate their vehicle's specific configuration.</p>
                </div>
              </div>
              
              {this.buildHierarchy()}
              
              {this.loading ? (
                <LoadingIndicator />
              ) : (
                this.buildSection()
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  saveSettings() {
    if (this.loading) return;
    
    this.loading = true;
    const promptText = this.promptText;
    const displayName = this.displayName;
    
    if (promptText === undefined || displayName === undefined) {
      app.alerts.show({ type: 'error' }, '无法获取设置值');
      this.loading = false;
      return;
    }
    
    const simpleData = {
      'ltydi-canbus-settings.promptText': promptText,
      'ltydi-canbus-settings.displayName': displayName
    };
    
    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/settings',
      body: simpleData
    })
    .then((response) => {
      this.loading = false;
      
      if (!app.data.settings) app.data.settings = {};
      app.data.settings['ltydi-canbus-settings.promptText'] = promptText;
      app.data.settings['ltydi-canbus-settings.displayName'] = displayName;
      
      if (app.forum && app.forum.data && app.forum.data.attributes) {
        app.forum.data.attributes['canbus.promptText'] = promptText;
        app.forum.data.attributes['canbus.displayName'] = displayName;
        if ('ltydi-canbus-settings.promptText' in app.forum.data.attributes) {
          app.forum.data.attributes['ltydi-canbus-settings.promptText'] = promptText;
        }
        if ('ltydi-canbus-settings.displayName' in app.forum.data.attributes) {
          app.forum.data.attributes['ltydi-canbus-settings.displayName'] = displayName;
        }
      }
      
      this.promptText = promptText;
      this.displayName = displayName;
      
      try {
        localStorage.setItem('canbus-settings-promptText', promptText);
        localStorage.setItem('canbus-settings-displayName', displayName);
      } catch (e) {}
      
      app.alerts.show({ type: 'success' }, 'Settings saved successfully');
      m.redraw();
    })
    .catch(error => {
      const requestBody = {
        data: [{
          type: 'settings',
          id: 'ltydi-canbus-settings.promptText',
          attributes: {
            value: promptText
          }
        }, {
          type: 'settings',
          id: 'ltydi-canbus-settings.displayName',
          attributes: {
            value: displayName
          }
        }]
      };
      
      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/settings',
        body: requestBody
      })
      .then((response) => {
        this.loading = false;
        
        if (!app.data.settings) app.data.settings = {};
        app.data.settings['ltydi-canbus-settings.promptText'] = promptText;
        app.data.settings['ltydi-canbus-settings.displayName'] = displayName;
        
        if (app.forum && app.forum.data && app.forum.data.attributes) {
          app.forum.data.attributes['canbus.promptText'] = promptText;
          app.forum.data.attributes['canbus.displayName'] = displayName;
          if ('ltydi-canbus-settings.promptText' in app.forum.data.attributes) {
            app.forum.data.attributes['ltydi-canbus-settings.promptText'] = promptText;
          }
          if ('ltydi-canbus-settings.displayName' in app.forum.data.attributes) {
            app.forum.data.attributes['ltydi-canbus-settings.displayName'] = displayName;
          }
        }
        
        try {
          localStorage.setItem('canbus-settings-promptText', promptText);
          localStorage.setItem('canbus-settings-displayName', displayName);
        } catch (e) {}
        
        app.alerts.show({ type: 'success' }, 'Settings saved successfully');
        m.redraw();
      })
      .catch(secondError => {
        this.loading = false;
        
        let errorMessage = 'Unknown error';
        
        if (secondError) {
          if (secondError.message) {
            errorMessage = secondError.message;
          }
          
          if (secondError.response) {
            try {
              if (secondError.response.data) {
                if (secondError.response.data.errors && secondError.response.data.errors.length > 0) {
                  const responseError = secondError.response.data.errors[0];
                  errorMessage = responseError.detail || responseError.title || errorMessage;
                }
              }
            } catch (e) {}
          }
        }
        
        try {
          if (!app.data.settings) app.data.settings = {};
          app.data.settings['ltydi-canbus-settings.promptText'] = promptText;
          app.data.settings['ltydi-canbus-settings.displayName'] = displayName;
          
          if (app.forum && app.forum.data && app.forum.data.attributes) {
            app.forum.data.attributes['canbus.promptText'] = promptText;
            app.forum.data.attributes['canbus.displayName'] = displayName;
            if ('ltydi-canbus-settings.promptText' in app.forum.data.attributes) {
              app.forum.data.attributes['ltydi-canbus-settings.promptText'] = promptText;
            }
            if ('ltydi-canbus-settings.displayName' in app.forum.data.attributes) {
              app.forum.data.attributes['ltydi-canbus-settings.displayName'] = displayName;
            }
          }
          
          this.promptText = promptText;
          this.displayName = displayName;
          
          try {
            localStorage.setItem('canbus-settings-promptText', promptText);
            localStorage.setItem('canbus-settings-displayName', displayName);
          } catch (e) {}
        } catch (cacheError) {}
        
        app.alerts.show({ type: 'error' }, 'Failed to save settings: ' + errorMessage);
      });
    });
  }
  
  buildHierarchy() {
    if (this.hierarchy.length === 0) {
      return null;
    }
    
    return (
      <div className="CanBusHierarchy">
        <div className="hierarchy-item" onclick={() => this.navigateTo('brands')}>
          <i className="fas fa-home"></i> {app.translator.trans('ltydi-canbus-settings.admin.brands.brand_list')}
        </div>
        
        {this.hierarchy.map((item, index) => (
          <div className="hierarchy-item" onclick={() => this.navigateTo(item.type, item, index)}>
            {this.getIconForType(item.type)} {item.name}
          </div>
        ))}
      </div>
    );
  }
  
  getIconForType(type) {
    switch (type) {
      case 'models':
        return <i className="fas fa-car"></i>;
      case 'years':
        return <i className="fas fa-calendar-alt"></i>;
      case 'configs':
        return <i className="fas fa-cogs"></i>;
      case 'links':
        return <i className="fas fa-link"></i>;
      default:
        return <i className="fas fa-folder"></i>;
    }
  }
  
  navigateTo(section, item = null, index = null) {
    this.section = section;
    
    if (index !== null) {
      this.hierarchy = this.hierarchy.slice(0, index + 1);
    } else if (section === 'brands') {
      this.hierarchy = [];
    }
    
    m.redraw();
  }
  
  buildSection() {
    switch (this.section) {
      case 'brands':
        return this.buildBrandList();
      case 'models':
        return <ModelList brandId={this.hierarchy[0].id} onSelect={this.selectModel.bind(this)} />;
      case 'years':
        return <YearList modelId={this.hierarchy[1].id} onSelect={this.selectYear.bind(this)} />;
      case 'configs':
        return <ConfigList yearId={this.hierarchy[2].id} onSelect={this.selectConfig.bind(this)} />;
      case 'links':
        return <LinkList configId={this.hierarchy[3].id} onUpdate={this.handleLinkUpdate.bind(this)} />;
      default:
        return <div>Unknown section</div>;
    }
  }
  
  buildBrandList() {
    return (
      <div className="BrandList">
        <h3>{app.translator.trans('ltydi-canbus-settings.admin.brands.title')}</h3>
        <p className="helpText">{app.translator.trans('ltydi-canbus-settings.admin.brands.help_text')}</p>
        
        <div className="CanBusForm">
          <div className="form-group">
            <label>{app.translator.trans('ltydi-canbus-settings.admin.brands.add_new')}</label>
            <input 
              type="text" 
              className="FormControl" 
              value={this.newBrand || ''} 
              oninput={e => this.newBrand = e.target.value} 
              placeholder={app.translator.trans('ltydi-canbus-settings.admin.brands.placeholder')} 
            />
          </div>
          
          {Button.component({
            className: 'Button Button--primary',
            disabled: this.loading || !this.newBrand || this.newBrand.trim() === '',
            onclick: () => this.saveBrand(),
            icon: 'fas fa-plus'
          }, app.translator.trans('ltydi-canbus-settings.admin.brands.add_button'))}
        </div>
        
        <div className="CanBusTableContainer">
          <table className="CanBusTable">
            <thead>
              <tr>
                <th>{app.translator.trans('ltydi-canbus-settings.admin.brands.brand_name', {}, 'Brand Name')}</th>
                <th className="actions">{app.translator.trans('ltydi-canbus-settings.admin.common.actions', {}, 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.brands && this.brands.map(brand => (
                <tr key={brand.id}>
                  <td>{brand.attributes.name}</td>
                  <td className="actions">
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-edit',
                      onclick: () => this.editBrand(brand),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.edit_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-trash',
                      onclick: () => this.deleteBrand(brand),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.delete_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-arrow-right',
                      onclick: () => this.selectBrand(brand),
                      title: app.translator.trans('ltydi-canbus-settings.admin.brands.view_models_title')
                    })}
                  </td>
                </tr>
              ))}
              
              {(!this.brands || this.brands.length === 0) && (
                <tr>
                  <td colSpan="2" className="text-center">
                    {app.translator.trans('ltydi-canbus-settings.admin.brands.no_brands')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
  selectBrand(brand) {
    this.hierarchy = [
      { type: 'models', id: brand.id, name: brand.attributes.name }
    ];
    this.section = 'models';
    m.redraw();
  }
  
  selectModel(model) {
    this.hierarchy.push(
      { type: 'years', id: model.id, name: model.attributes.name }
    );
    this.section = 'years';
    m.redraw();
  }
  
  selectYear(year) {
    this.hierarchy.push(
      { type: 'configs', id: year.id, name: year.attributes.year_range }
    );
    this.section = 'configs';
    m.redraw();
  }
  
  selectConfig(config) {
    if (!config || !config.id) {
      alert("Unable to select configuration: Invalid configuration data");
      return;
    }
    
    try {
      this.hierarchy.push(
        { type: 'links', id: config.id, name: config.attributes.name }
      );
      this.section = 'links';
      m.redraw();
    } catch (error) {
      alert("Error selecting configuration: " + error.message);
    }
  }
  
  saveBrand() {
    if (!this.newBrand || !this.newBrand.trim()) {
      alert('Brand name cannot be empty');
      return;
    }
    
    const brandName = this.newBrand.trim();
    this.loading = true;
    
    const url = app.forum.attribute('apiUrl') + '/canbus/brands?name=' + encodeURIComponent(brandName);
    
    app.request({
      method: 'POST',
      url: url
    }).then(result => {
      this.brands.push(result.data);
      this.newBrand = '';
      this.loading = false;
      m.redraw();
    }).catch(error => {
      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/canbus/brands'
      }).then(result => {
        this.brands.push(result.data);
        this.newBrand = '';
        this.loading = false;
        m.redraw();
      }).catch(secondError => {
        this.loading = false;
        m.redraw();
        alert('Error adding brand: ' + (error.response && error.response.errors ? error.response.errors[0].detail : error));
      });
    });
  }
  
  editBrand(brand) {
    app.modal.show(EditBrandModal, {
      brand: brand,
      onsubmit: (newName) => {
        if (!newName || newName === brand.attributes.name) return;
        
        this.loading = true;
        
        const requestData = {
          data: {
            type: 'canbus-brands',
            id: brand.id,
            attributes: {
              name: newName.trim()
            }
          }
        };
        
        app.request({
          method: 'PATCH',
          url: app.forum.attribute('apiUrl') + '/canbus/brands/' + brand.id,
          body: requestData
        }).then(result => {
          const index = this.brands.findIndex(b => b.id === brand.id);
          if (index !== -1) {
            this.brands[index] = result.data;
          }
          this.loading = false;
          m.redraw();
          this.loadBrands();
          app.alerts.show({type: 'success'}, `Brand updated successfully to: ${newName.trim()}`);
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error updating brand: ' + (error.response && error.response.errors ? error.response.errors[0].detail : error));
        });
      }
    });
  }
  
  deleteBrand(brand) {
    app.modal.show(DeleteBrandModal, {
      brand: brand,
      onconfirm: () => {
        this.loading = true;
        
        app.request({
          method: 'DELETE',
          url: app.forum.attribute('apiUrl') + '/canbus/brands/' + brand.id
        }).then(() => {
          this.brands = this.brands.filter(b => b.id !== brand.id);
          this.loading = false;
          m.redraw();
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error deleting brand: ' + (error.response && error.response.errors ? error.response.errors[0].detail : error));
        });
      }
    });
  }
  
  handleLinkUpdate(data) {
    if (data && data.action && data.configId) {
      this.section = 'links';
      m.redraw();
    }
  }
}