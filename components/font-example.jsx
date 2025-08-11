import React from 'react';
import { useLanguage } from '@/lib/language-provider';
import RTLWrapper from './rtl-wrapper';
import RTLIcon from './rtl-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const FontExample = () => {
  const { language, toggleLanguage, isRTL } = useLanguage();

  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Cairo Font Examples</h1>
        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
          <Badge variant="outline" className="rtl-numbers">
            {language.toUpperCase()}
          </Badge>
          <Button onClick={toggleLanguage} variant="outline" size="sm">
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </div>
      
      {/* English Text Examples */}
      <RTLWrapper>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <RTLIcon flipInRTL>
                <ArrowRight className="h-5 w-5" />
              </RTLIcon>
              <span>English Text Examples:</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-light">Light weight (200) - Welcome to DeelDeal</p>
              <p className="font-normal">Normal weight (400) - Welcome to DeelDeal</p>
              <p className="font-medium">Medium weight (500) - Welcome to DeelDeal</p>
              <p className="font-semibold">Semibold weight (600) - Welcome to DeelDeal</p>
              <p className="font-bold">Bold weight (700) - Welcome to DeelDeal</p>
              <p className="font-extrabold">Extra Bold weight (800) - Welcome to DeelDeal</p>
              <p className="font-black">Black weight (900) - Welcome to DeelDeal</p>
            </div>
          </CardContent>
        </Card>
      </RTLWrapper>

      {/* Arabic Text Examples */}
      <RTLWrapper>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <RTLIcon flipInRTL>
                <ArrowLeft className="h-5 w-5" />
              </RTLIcon>
              <span>Arabic Text Examples:</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-light">وزن خفيف (200) - مرحباً بك في ديل ديل</p>
              <p className="font-normal">وزن عادي (400) - مرحباً بك في ديل ديل</p>
              <p className="font-medium">وزن متوسط (500) - مرحباً بك في ديل ديل</p>
              <p className="font-semibold">وزن شبه عريض (600) - مرحباً بك في ديل ديل</p>
              <p className="font-bold">وزن عريض (700) - مرحباً بك في ديل ديل</p>
              <p className="font-extrabold">وزن عريض جداً (800) - مرحباً بك في ديل ديل</p>
              <p className="font-black">وزن أسود (900) - مرحباً بك في ديل ديل</p>
            </div>
          </CardContent>
        </Card>
      </RTLWrapper>

      {/* Mixed Language Example */}
      <RTLWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Mixed Language Example:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <p className="font-medium">
                English: Welcome to DeelDeal - منصة تبادل العناصر
              </p>
              <p className="font-medium">
                العربية: مرحباً بك في ديل ديل - Item Exchange Platform
              </p>
            </div>
          </CardContent>
        </Card>
      </RTLWrapper>

      {/* RTL Layout Example */}
      <RTLWrapper>
        <Card>
          <CardHeader>
            <CardTitle>RTL Layout Example:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Navigation Bar */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <RTLIcon flipInRTL>
                    <ArrowLeft className="h-4 w-4" />
                  </RTLIcon>
                  <span>Back</span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span>Home</span>
                  <span>Products</span>
                  <span>About</span>
                  <RTLIcon flipInRTL>
                    <ArrowRight className="h-4 w-4" />
                  </RTLIcon>
                </div>
              </div>

              {/* Content with Icons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <span>First Item</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <span>Second Item</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </RTLWrapper>

      {/* Usage Instructions */}
      <RTLWrapper>
        <Card>
          <CardHeader>
            <CardTitle>How to use Cairo font with RTL:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Font Usage:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Default: All text automatically uses Cairo font</li>
                    <li>• Explicit class: <code className="bg-muted px-1 rounded">font-cairo</code></li>
                    <li>• Weights: <code className="bg-muted px-1 rounded">font-light</code>, <code className="bg-muted px-1 rounded">font-normal</code>, <code className="bg-muted px-1 rounded">font-medium</code>, etc.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">RTL Support:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Use <code className="bg-muted px-1 rounded">RTLWrapper</code> component</li>
                    <li>• Use <code className="bg-muted px-1 rounded">RTLIcon</code> for directional icons</li>
                    <li>• Add <code className="bg-muted px-1 rounded">rtl:space-x-reverse</code> for spacing</li>
                    <li>• Use <code className="bg-muted px-1 rounded">rtl-numbers</code> for numbers</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded">
                <p className="text-sm">
                  <strong>Current Status:</strong> Language: {language === 'en' ? 'English' : 'العربية'} | 
                  Direction: {isRTL ? 'RTL' : 'LTR'} | 
                  Font: Cairo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RTLWrapper>
    </div>
  );
};

export default FontExample;
