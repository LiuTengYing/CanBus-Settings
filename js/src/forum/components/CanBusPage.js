import app from 'flarum/forum/app';
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
          <h2>CanBus Settings</h2>
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
    return (
      <div className="CanBusContent" style={{marginTop: '30px', marginBottom: '30px'}}>
        {/* Display image preview (using img tag instead of iframe) */}
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
            
            // Display error message and link when image fails to load
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.style.margin = '20px 0';
            errorMessage.innerHTML = `
              <p><i class="fas fa-exclamation-triangle"></i> ${app.translator.trans('ltydi-canbus-settings.forum.image_load_error')}</p>
              <p>${app.translator.trans('ltydi-canbus-settings.forum.use_button_below')}</p>
            `;
            e.target.parentNode.insertBefore(errorMessage, e.target.nextSibling);
          }}
        />
        
        {/* Button to open in new window */}
        <div style={{ textAlign: 'center', margin: '15px 0' }}>
          <Button
            className="Button Button--primary"
            onclick={() => window.open(url, '_blank')}
            icon="fas fa-external-link-alt"
          >
            Open in New Window
          </Button>
        </div>
        
        {/* Always display link description area, whether there is a description or not */}
        <div className="CanBusLinkDescription" style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          color: '#495057',
          lineHeight: '1.5'
        }}>
          <i className="fas fa-info-circle" style={{marginRight: '8px', color: '#3176d9', fontSize: '18px'}}></i>
          {description || app.translator.trans('ltydi-canbus-settings.forum.no_additional_info')}
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

  getDirectDownloadUrl(url) {
    try {
      if (!url) return '';
      
      // 处理Google Drive链接
      if (url.includes('drive.google.com')) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (fileId) {
          // 尝试使用导出为图片的方式 (有些情况可能有效)
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        return url;
      }
      
      // 处理相对路径
      if (url.startsWith('/')) {
        const baseUrl = app.forum.attribute('baseUrl') || '';
        return baseUrl + url;
      }
      
      // 处理不带协议的链接
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      
      // 如果是图片链接，但不带协议，添加协议
      if (!url.match(/^https?:\/\//i) && this.isImageUrl(url)) {
        return 'https://' + url;
      }
      
      // 其他类型链接直接返回
      return url;
    } catch (error) {
      console.error('Error processing download URL:', error);
      return url;
    }
  }
   
  extractGoogleDriveFileId(url) {
    if (!url) return null;
    
    // 提取Google Drive文件ID
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
    
    // 检查URL是否以图片扩展名结尾
    const imageExtensionRegex = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    
    // 对于Google Drive链接，我们假设它们是图片（因为在此应用场景中主要是图片）
    if (url.includes('drive.google.com')) {
      return true;
    }
    
    return imageExtensionRegex.test(url);
  }
  
  isGoogleDriveUrl(url) {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }
  
  // 辅助方法：返回到之前的步骤
  backToStep(step) {
    this.currentStep = step;
    m.redraw();
  }
}