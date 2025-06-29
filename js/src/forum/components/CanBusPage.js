import Page from 'flarum/common/components/Page';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';
import Button from 'flarum/common/components/Button';

export default class CanBusPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    
    this.loading = {
      brands: true,
      models: false,
      years: false,
      configs: false,
      link: false
    };
    
    this.brands = [];
    this.models = [];
    this.years = [];
    this.configs = [];
    this.link = null;
    
    this.selectedBrandId = null;
    this.selectedModelId = null;
    this.selectedYearId = null;
    this.selectedConfigId = null;
    
    this.currentStep = 1;
    
    this.loadBrands();
  }
  
  view() {
    // 获取自定义显示名称
    const displayName = app.forum.attribute('canbus.displayName') || 
                       app.data?.settings?.['ltydi-canbus-settings.displayName'] || 
                       'CanBus Settings';
    
    // 使用多种方式获取提示文本，确保有备用
    let promptText = '';
    
    // 尝试从app.forum.attributes获取（首选方式）
    if (app.forum && app.forum.attribute('canbus.promptText')) {
      promptText = app.forum.attribute('canbus.promptText');
    } 
    // 如果上面的方式失败，尝试从app.data.settings获取
    else if (app.data && app.data.settings && app.data.settings['ltydi-canbus-settings.promptText']) {
      promptText = app.data.settings['ltydi-canbus-settings.promptText'];
    }
    // 如果仍然没有，使用默认文本
    else {
      promptText = "Please select the appropriate CANBUs type based on the actual product you received. To access the CANBUs settings, navigate to: Settings- Factory (enter \"3368\")→ Car Model.";
    }
    
    return (
      <div className="CanBusPage">
        <div className="container">
          <h2>{displayName}</h2>
          <p>{promptText}</p>
          <p className="SelectionOrder">Selection order: Car Brand → Car Model → Year Range → Configuration</p>
          
          <div className="CanBusProgressBar">
            <div className="CanBusProgressStep completed">
              <div className="CanBusProgressDot"></div>
              <span>Start</span>
            </div>
            <div className={"CanBusProgressStep" + (this.selectedBrandId ? ' completed' : '')}>
              <div className="CanBusProgressDot"></div>
              <span>Brand</span>
            </div>
            <div className={"CanBusProgressStep" + (this.selectedModelId ? ' completed' : '')}>
              <div className="CanBusProgressDot"></div>
              <span>Model</span>
            </div>
            <div className={"CanBusProgressStep" + (this.selectedYearId ? ' completed' : '')}>
              <div className="CanBusProgressDot"></div>
              <span>Year</span>
            </div>
            <div className={"CanBusProgressStep" + (this.selectedConfigId ? ' completed' : '')}>
              <div className="CanBusProgressDot"></div>
              <span>Config</span>
            </div>
          </div>
          
          <div className="CanBusSelectors-container">
            <div className={"Form-group" + (this.isCurrentStep('brand') ? ' active' : '')}>
              <label>Car Brand</label>
              {this.loading.brands ? (
                <LoadingIndicator />
              ) : (
                <Select
                  value={this.selectedBrandId || ''}
                  options={this.getBrandOptions()}
                  onchange={this.onBrandChange.bind(this)}
                />
              )}
            </div>
            
            <div className={"Form-group" + (this.isCurrentStep('model') ? ' active' : '')}>
              <label>Car Model</label>
              {this.loading.models ? (
                <LoadingIndicator />
              ) : (
                <Select
                  value={this.selectedModelId || ''}
                  options={this.getModelOptions()}
                  onchange={this.onModelChange.bind(this)}
                  disabled={!this.selectedBrandId}
                />
              )}
              {!this.selectedBrandId && <small className="SelectionHint">Please select a Car Brand first</small>}
            </div>
            
            <div className={"Form-group" + (this.isCurrentStep('year') ? ' active' : '')}>
              <label>Year Range</label>
              {this.loading.years ? (
                <LoadingIndicator />
              ) : (
                <Select
                  value={this.selectedYearId || ''}
                  options={this.getYearOptions()}
                  onchange={this.onYearChange.bind(this)}
                  disabled={!this.selectedModelId}
                />
              )}
              {!this.selectedModelId && <small className="SelectionHint">Please select a Car Model first</small>}
            </div>
            
            <div className={"Form-group" + (this.isCurrentStep('config') ? ' active' : '')}>
              <label>Configuration</label>
              {this.loading.configs ? (
                <LoadingIndicator />
              ) : (
                <Select
                  value={this.selectedConfigId || ''}
                  options={this.getConfigOptions()}
                  onchange={this.onConfigChange.bind(this)}
                  disabled={!this.selectedYearId}
                />
              )}
              {!this.selectedYearId && <small className="SelectionHint">Please select a Year Range first</small>}
            </div>
          </div>
          
          {this.loading.link ? (
            <LoadingIndicator />
          ) : this.link && this.link.attributes && this.link.attributes.url ? (
            this.renderLinkContent(this.link.attributes.url, this.link.attributes.description)
          ) : this.selectedConfigId ? (
            <div className="alert alert-info" style={{
              margin: '30px 0',
              padding: '20px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="fas fa-info-circle" style={{marginRight: '10px', fontSize: '24px', color: '#3176d9'}}></i>
              <div>
                <p style={{margin: '0', fontWeight: 'bold'}}>No configuration image available for this selection.</p>
                <p style={{margin: '5px 0 0 0'}}>Please try another configuration or contact support for assistance.</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  
  renderLinkContent(url, description) {
    const isPdf = this.isPdfUrl(url);
    const isImage = this.isImageUrl(url);
    
    return (
      <div className="CanBusContent" style={{marginTop: '30px', marginBottom: '30px'}}>
        {isPdf ? (
          <div style={{
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            margin: '20px auto',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{
              width: '100%',
              height: '500px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <iframe 
                src={this.getPreviewUrl(url)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="CanBus Configuration PDF Preview"
                onload={(e) => {
                  // 强制刷新iframe以解决多页PDF加载问题
                  setTimeout(() => {
                    if (e.target && e.target.contentWindow) {
                      try {
                        e.target.contentWindow.location.reload();
                      } catch (error) {
                        console.log('Cannot reload iframe due to cross-origin restrictions');
                      }
                    }
                  }, 1000);
                  
                  // 延迟刷新机制
                  setTimeout(() => {
                    if (e.target) {
                      const currentSrc = e.target.src;
                      e.target.src = '';
                      setTimeout(() => {
                        e.target.src = currentSrc;
                      }, 100);
                    }
                  }, 2000);
                }}
                onError={(e) => {
                  console.error('PDF preview failed:', url);
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'padding: 40px; text-align: center; color: #666;';
                  errorDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ffc107;"></i>
                    <p>PDF preview unavailable. Please use the buttons below to view or download the file.</p>
                  `;
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
            </div>
          </div>
        ) : isImage ? (
          <img 
            src={this.getDirectDownloadUrl(url)}
            alt="CanBus Configuration"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              margin: '20px auto',
              maxHeight: '600px',
              objectFit: 'contain',
              border: '1px solid #e9ecef',
              borderRadius: '4px'
            }}
            onError={(e) => {
              console.error('Image failed to load:', url);
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'alert alert-danger';
              errorDiv.style.margin = '20px 0';
              errorDiv.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> Image failed to load</p>
                <p>Please use the button below to open in a new window</p>
              `;
              e.target.parentNode.insertBefore(errorDiv, e.target.nextSibling);
            }}
          />
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            margin: '20px auto',
            backgroundColor: '#f8f9fa'
          }}>
            <i className="fas fa-file" style={{fontSize: '48px', color: '#6c757d', marginBottom: '15px'}}></i>
            <p>Configuration file available</p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Button
            className="Button Button--primary"
            onclick={() => {
              if (isPdf) {
                window.open(this.getFullViewUrl(url), '_blank');
              } else {
                window.open(this.getDirectDownloadUrl(url), '_blank');
              }
            }}
            icon={isPdf ? "fas fa-external-link-alt" : isImage ? "fas fa-image" : "fas fa-external-link-alt"}
            style={{ marginRight: '10px', padding: '10px 20px' }}
          >
            {isPdf ? 'Open PDF in New Window' : isImage ? 'View Full Image' : 'Open File'}
          </Button>
          <Button
            className="Button Button--secondary"
            onclick={() => {
              const link = document.createElement('a');
              link.href = this.getDownloadUrl(url);
              link.download = isPdf ? 'canbus-configuration.pdf' : isImage ? 'canbus-configuration.jpg' : 'canbus-configuration';
              link.click();
            }}
            icon="fas fa-download"
            style={{ padding: '10px 20px' }}
          >
            Download {isPdf ? 'PDF' : isImage ? 'Image' : 'File'}
          </Button>
        </div>
      </div>
    );
  }
  
  getBrandOptions() {
    let options = {};
    options[''] = '';
    
    if (this.brands && this.brands.length) {
      this.brands.forEach(brand => {
        options[brand.id] = brand.attributes.name;
      });
    }
    
    return options;
  }
  
  getModelOptions() {
    let options = {};
    options[''] = '';
    
    if (this.models && this.models.length) {
      this.models.forEach(model => {
        options[model.id] = model.attributes.name;
      });
    }
    
    return options;
  }
  
  getYearOptions() {
    let options = {};
    options[''] = '';
    
    if (this.years && this.years.length) {
      this.years.forEach(year => {
        options[year.id] = year.attributes.year_range;
      });
    }
    
    return options;
  }
  
  getConfigOptions() {
    let options = {};
    options[''] = '';
    
    if (this.configs && this.configs.length) {
      this.configs.forEach(config => {
        options[config.id] = config.attributes.name;
      });
    }
    
    return options;
  }
  
  onBrandChange(brandId) {
    this.selectedBrandId = brandId || null;
    this.selectedModelId = null;
    this.selectedYearId = null;
    this.selectedConfigId = null;
    this.link = null;
    
    if (this.selectedBrandId) {
      this.selectedBrand = this.brands.find(brand => brand.id === this.selectedBrandId);
      this.loadModels();
    } else {
      this.models = [];
      this.years = [];
      this.configs = [];
      m.redraw();
    }
  }
  
  onModelChange(modelId) {
    this.selectedModelId = modelId || null;
    this.selectedYearId = null;
    this.selectedConfigId = null;
    this.link = null;
    
    if (this.selectedModelId) {
      this.selectedModel = this.models.find(model => model.id === this.selectedModelId);
      this.loadYears();
    } else {
      this.years = [];
      this.configs = [];
      m.redraw();
    }
  }
  
  onYearChange(yearId) {
    this.selectedYearId = yearId || null;
    this.selectedConfigId = null;
    this.link = null;
    
    if (this.selectedYearId) {
      this.selectedYear = this.years.find(year => year.id === this.selectedYearId);
      this.loadConfigs();
    } else {
      this.configs = [];
      m.redraw();
    }
  }
  
  onConfigChange(configId) {
    this.selectedConfigId = configId || null;
    
    if (this.selectedConfigId) {
      this.selectedConfig = this.configs.find(config => config.id === this.selectedConfigId);
      this.loadLink();
    } else {
      this.link = null;
      m.redraw();
    }
  }
  
  loadBrands() {
    this.loading.brands = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/brands'
    }).then(result => {
      this.brands = result.data || [];
      this.loading.brands = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading brands:', error);
      this.loading.brands = false;
      m.redraw();
    });
  }
  
  loadModels() {
    this.loading.models = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/models',
      params: {
        'filter[brand_id]': this.selectedBrandId
      }
    }).then(result => {
      if (result && result.data) {
        this.models = result.data;
      } else {
        this.models = [];
      }
      this.loading.models = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading models:', error);
      this.models = [];
      this.loading.models = false;
      m.redraw();
    });
  }
  
  loadYears() {
    this.loading.years = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/years',
      params: {
        'filter[model_id]': this.selectedModelId
      }
    }).then(result => {
      this.years = result.data || [];
      this.loading.years = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading years:', error);
      this.years = [];
      this.loading.years = false;
      m.redraw();
    });
  }
  
  loadConfigs() {
    this.loading.configs = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/configs',
      params: {
        'filter[year_id]': this.selectedYearId
      }
    }).then(result => {
      this.configs = result.data || [];
      this.loading.configs = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading configs:', error);
      this.configs = [];
      this.loading.configs = false;
      m.redraw();
    });
  }
  
  loadLink() {
    this.loading.link = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/links',
      params: {
        'filter[config_id]': this.selectedConfigId
      }
    }).then(result => {
      if (result.data && result.data.length > 0) {
        this.link = result.data[0];
      } else {
        this.link = null;
      }
      this.loading.link = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading link:', error);
      this.link = null;
      this.loading.link = false;
      m.redraw();
    });
  }
  
  isCurrentStep(step) {
    if (step === 'brand') return !this.selectedBrandId;
    if (step === 'model') return this.selectedBrandId && !this.selectedModelId;
    if (step === 'year') return this.selectedModelId && !this.selectedYearId;
    if (step === 'config') return this.selectedYearId && !this.selectedConfigId;
    return false;
  }

  getFullViewUrl(url) {
    try {
      if (!url) return '';
      
      if (url.includes('drive.google.com')) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/view`;
        }
        return url;
      }
      
      return this.getDirectDownloadUrl(url);
    } catch (error) {
      console.error('Error processing full view URL:', error);
      return url;
    }
  }

  getPreviewUrl(url) {
    try {
      if (!url) return '';
      
      if (url.includes('drive.google.com')) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview?usp=sharing&embedded=true`;
        }
        return url;
      }
      
      return this.getDirectDownloadUrl(url);
    } catch (error) {
      console.error('Error processing preview URL:', error);
      return url;
    }
  }

  getDownloadUrl(url) {
    try {
      if (!url) return '';
      
      if (url.includes('drive.google.com')) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (fileId) {
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        return url;
      }
      
      return this.getDirectDownloadUrl(url);
    } catch (error) {
      console.error('Error processing download URL:', error);
      return url;
    }
  }

  getDirectDownloadUrl(url) {
    try {
      if (!url) return '';
      
      if (url.includes('drive.google.com')) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/view`;
        }
        return url;
      }
      
      if (url.startsWith('/')) {
        const baseUrl = app.forum.attribute('baseUrl') || '';
        return baseUrl + url;
      }
      
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      
      if (!url.match(/^https?:\/\//i)) {
        return 'https://' + url;
      }
      
      return url;
    } catch (error) {
      console.error('Error processing download URL:', error);
      return url;
    }
  }
   
  extractGoogleDriveFileId(url) {
    if (!url) return null;
    
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }
  
  isImageUrl(url) {
    if (!url) return false;
    
    const imageExtensionRegex = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    return imageExtensionRegex.test(url);
  }
  
  isGoogleDriveUrl(url) {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }

  isPdfUrl(url) {
    if (!url) return false;
    
    const pdfExtensionRegex = /\.pdf$/i;
    
    if (pdfExtensionRegex.test(url)) {
      return true;
    }
    
    if (url.includes('drive.google.com')) {
      return true;
    }
    
    return false;
  }
}